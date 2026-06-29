const IMGBB_API_KEY = "612721d402d431da9fa9e05a60c78e04";

export const uploadImageToImgBB = async (
  uri: string,
): Promise<string | null> => {
  try {
    const filename = uri.split("/").pop();
    const match = /\.(\w+)$/.exec(filename || "");
    const type = match ? `image/${match[1]}` : `image`;
    const formData = new FormData();
    formData.append("image", { uri, name: filename, type } as any);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      {
        method: "POST",
        body: formData,
      },
    );

    const json = await response.json();
    return json.success ? json.data.url : null;
  } catch (err) {
    console.error("ImgBB upload error:", err);
    return null;
  }
};
