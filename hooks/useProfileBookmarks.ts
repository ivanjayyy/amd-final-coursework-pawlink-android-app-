import { useEffect, useState } from "react";
import {
  collection,
  doc,
  deleteDoc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { PetReport } from "./useFeedFilter";

export function useProfileBookmarks(userId: string | undefined) {
  const [bookmarkedReports, setBookmarkedReports] = useState<PetReport[]>([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoadingBookmarks(false);
      return;
    }

    const bookmarksRef = collection(db, "user_bookmarks");
    const bookmarksQuery = query(bookmarksRef, where("userId", "==", userId));

    const unsubscribeBookmarks = onSnapshot(
      bookmarksQuery,
      (bookmarkSnapshot) => {
        const targetIds: string[] = [];
        bookmarkSnapshot.forEach((doc) => {
          targetIds.push(doc.data().reportId);
        });

        if (targetIds.length === 0) {
          setBookmarkedReports([]);
          setLoadingBookmarks(false);
          return;
        }

        const reportsRef = collection(db, "pet_reports");
        const reportsQuery = query(reportsRef, orderBy("createdAt", "desc"));

        const unsubscribeReports = onSnapshot(
          reportsQuery,
          (reportSnapshot) => {
            const matchedReports: PetReport[] = [];
            reportSnapshot.forEach((doc) => {
              if (targetIds.includes(doc.id)) {
                matchedReports.push({ id: doc.id, ...doc.data() } as PetReport);
              }
            });
            setBookmarkedReports(matchedReports);
            setLoadingBookmarks(false);
          },
          (error) => {
            console.error("Error matching collection data:", error);
            setLoadingBookmarks(false);
          },
        );

        return () => unsubscribeReports();
      },
    );

    return () => unsubscribeBookmarks();
  }, [userId]);

  const handleToggleBookmark = async (reportId: string) => {
    if (!userId) return;
    const bookmarkDocId = `${userId}_${reportId}`;
    const docReference = doc(db, "user_bookmarks", bookmarkDocId);

    try {
      const isAlreadyBookmarked = bookmarkedReports.some(
        (r) => r.id === reportId,
      );
      if (isAlreadyBookmarked) {
        await deleteDoc(docReference);
      } else {
        await setDoc(docReference, {
          userId,
          reportId,
          savedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error("Cloud bookmark adjustment crash: ", err);
    }
  };

  return { bookmarkedReports, loadingBookmarks, handleToggleBookmark };
}
