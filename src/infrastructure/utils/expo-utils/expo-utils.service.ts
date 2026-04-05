import { AppImageFile } from "@/infrastructure/image/image.schema";
import * as FileSystem from "expo-file-system";
import { PERSISTENT_IMAGE_DIR } from "../../image/image.service";
import { PERSISTENT_DOC_DIR } from "../../document/document.service";

type DirectoryKey = "images" | "documents";

const DIRECTORY_PATHS: Record<DirectoryKey, string> = {
  images: PERSISTENT_IMAGE_DIR,
  documents: PERSISTENT_DOC_DIR,
};

export async function ensurePersistentDir(
  PERSISTENT_DIR: string,
): Promise<void> {
  const info = await FileSystem.getInfoAsync(PERSISTENT_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(PERSISTENT_DIR, {
      intermediates: true,
    });
  }
}

export async function moveToPersistentDir({
  file,
  dir,
}: {
  file: AppImageFile;
  dir: DirectoryKey; //single directory only
}): Promise<string> {
  if (!FileSystem.documentDirectory) {
    throw new Error("Document directory unavailable");
  }

  const path = DIRECTORY_PATHS[dir];

  await ensurePersistentDir(path);

  const newFileName = `${Date.now()}-${file.name}`;
  const newPath = `${path}${newFileName}`;

  try {
    await FileSystem.copyAsync({
      from: file.uri,
      to: newPath,
    });

    return newPath;
  } catch (err) {
    console.error("Failed to persist file:", err);
    throw err;
  }
}

export async function logExpoSystemDir(dirs: DirectoryKey | DirectoryKey[]) {
  const targets = Array.isArray(dirs) ? dirs : [dirs];

  for (const key of targets) {
    const path = DIRECTORY_PATHS[key];

    try {
      const dirInfo = await FileSystem.getInfoAsync(path);
      console.log(
        "-----------------------------------------------------------------",
      );
      console.log("dirInfo:", dirInfo);

      if (!dirInfo.exists) {
        console.log(
          "Directory does not exist (yet). Safe to create on first save.",
        );
        console.log(
          "-----------------------------------------------------------------",
        );
        continue;
      }

      // Only read if directory exists
      const files = await FileSystem.readDirectoryAsync(path);
      console.log(`Files in ${key} dir: `, files);
      console.log(
        "-----------------------------------------------------------------",
      );
    } catch (err: any) {
      console.error("logExpoSystemDir failed:", err.message);
    }
  }
}

export async function expoStorageCleaner(
  dirs: DirectoryKey | DirectoryKey[],
): Promise<void> {
  if (!FileSystem.documentDirectory) {
    throw new Error("Document directory unavailable");
  }

  const targets = Array.isArray(dirs) ? dirs : [dirs];

  for (const key of targets) {
    const path = DIRECTORY_PATHS[key];

    const dirInfo = await FileSystem.getInfoAsync(path);
    if (!dirInfo.exists) continue;

    const files = await FileSystem.readDirectoryAsync(path);

    for (const file of files) {
      try {
        await FileSystem.deleteAsync(`${path}${file}`);
      } catch (err) {
        console.warn(`Failed to delete ${file} in ${path}:`, err);
      }
    }
  }

  console.log("Storage cleaned successfully");
}
