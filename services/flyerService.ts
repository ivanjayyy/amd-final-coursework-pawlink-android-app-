import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";

export interface PetReport {
  id: string;
  petName: string;
  status: "lost" | "found";
  species: string;
  breed: string;
  lastSeenLocation: string;
  description: string;
  imageUrl?: string;
  createdAt: string;
  reward?: string;
}

export const generateAndShareFlyer = async (item: PetReport) => {
  const isLost = item.status === "lost";
  const headerColor = isLost ? "#FF4A4A" : "#2E7D32";

  const htmlTemplate = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          /* CSS Reset & Single-Page Constraints */
          * { box-sizing: border-box; margin: 0; padding: 0; }
          
          @page {
            size: A4;
            margin: 0mm; /* Wipes out default browser headers and footers */
          }

          html, body {
            width: 100%;
            height: 100vh;
            overflow: hidden;
            background-color: #ffffff;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          }

          body {
            padding: 20px;
            display: flex;
            flex-direction: column;
            justify-content: stretch;
            align-items: stretch;
          }

          /* Retro Neo-brutalism Full Page Wrapper */
          .border-wrap {
            border: 12px solid #000000;
            padding: 24px;
            box-shadow: 12px 12px 0px #000000;
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: calc(100% - 12px); /* Offsets shadow thickness to prevent push */
            overflow: hidden;
          }

          .badge {
            background-color: ${headerColor};
            color: white;
            font-size: 38px;
            font-weight: 900;
            padding: 16px;
            border: 5px solid #000000;
            text-align: center;
            letter-spacing: 4px;
            margin-bottom: 16px;
            flex-shrink: 0;
          }

          /* Dynamic Flex Image Frame */
          .image-container {
            flex: 1;
            min-height: 250px;
            margin-bottom: 16px;
            position: relative;
          }

          .pet-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border: 5px solid #000000;
          }

          .name {
            font-size: 52px;
            font-weight: 900;
            text-align: center;
            margin-bottom: 12px;
            letter-spacing: 2px;
            text-transform: uppercase;
            line-height: 1;
            flex-shrink: 0;
          }

          .reward {
            background-color: #FFD700;
            font-size: 26px;
            font-weight: 900;
            padding: 12px;
            border: 4px solid #000000;
            margin-bottom: 16px;
            text-align: center;
            display: ${isLost && item.reward ? "block" : "none"};
            flex-shrink: 0;
          }

          /* Structured Layout Metadata Box */
          .details {
            font-size: 16px;
            text-align: left;
            background: #f9f9f9;
            padding: 18px;
            border: 4px solid #000000;
            flex-shrink: 0;
          }

          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-bottom: 12px;
          }

          .details p {
            font-weight: bold;
            text-transform: uppercase;
          }

          .details span {
            font-weight: normal;
            color: #333;
          }

          .desc-box {
            font-weight: normal;
            color: #222;
            background: #fff;
            padding: 12px;
            border: 2px solid #000;
            margin-top: 6px;
            font-size: 14px;
            line-height: 1.4;
          }
        </style>
      </head>
      <body>
        <div class="border-wrap">
          <div class="badge">${item.status.toUpperCase()} PET ALERT</div>
          
          ${
            item.imageUrl
              ? `
          <div class="image-container">
            <img src="${item.imageUrl}" class="pet-image" />
          </div>
          `
              : ""
          }
          
          <div class="name">${item.petName || "UNKNOWN"}</div>
          
          <div class="reward">⚠️ REWARD: ${item.reward}</div>
          
          <div class="details">
            <div class="details-grid">
              <p>SPECIES: <span>${item.species}</span></p>
              <p>BREED: <span>${item.breed}</span></p>
            </div>
            <p style="margin-bottom: 8px;">LAST SEEN VECTOR: <span>${item.lastSeenLocation}</span></p>
            <p>DISTINCTIVE CHARACTERISTICS:</p>
            <div class="desc-box">${item.description}</div>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({
      html: htmlTemplate,
      margins: { left: 0, right: 0, top: 0, bottom: 0 }, // Overrides system print layouts
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: `Download ${item.petName} Flyer`,
      });
    } else {
      Alert.alert("EXPORT COMPLETED", `Flyer localized at: ${uri}`);
    }
  } catch (err) {
    Alert.alert(
      "FLYER FAULT",
      "Could not compile PDF template asset configuration.",
    );
  }
};
