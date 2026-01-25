export async function uploadToR2Presigned(
  file: File,
  folder: string = "general",
  onProgress?: (progress: number) => void,
): Promise<string> {
  // Step 1: Get Presigned URL
  const presignedRes = await fetch("/api/upload/r2/presigned", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type || "application/octet-stream",
      folder: folder,
    }),
  });

  if (!presignedRes.ok) {
    const error = await presignedRes.json().catch(() => ({}));
    throw new Error(error.error || "Failed to get upload URL");
  }

  const { uploadUrl, publicUrl } = await presignedRes.json();

  // Step 2: Upload to R2 directly
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream",
    );

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percentComplete = (event.loaded / event.total) * 100;
        onProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201 || xhr.status === 204) {
        resolve(publicUrl);
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("Direct upload failed"));
    xhr.send(file);
  });
}

export async function uploadToR2(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload/r2");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percentComplete = (event.loaded / event.total) * 100;
        onProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response.url);
        } catch (e) {
          reject(e);
        }
      } else {
        reject(new Error("Upload failed"));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed"));

    const formData = new FormData();
    formData.append("file", file);
    xhr.send(formData);
  });
}

export async function deleteFromR2(url: string): Promise<void> {
  const res = await fetch("/api/upload/r2", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    throw new Error("Failed to delete file");
  }
}
