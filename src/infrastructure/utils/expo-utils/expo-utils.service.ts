import { AppImageFile } from "@/infrastructure/image/image.schema";
import * as FileSystem from "expo-file-system";
import { PERSISTENT_IMAGE_DIR } from "../../image/image.service";
import { PERSISTENT_DOC_DIR } from "../../document/document.service";

type DirectoryKey = "images" | "documents";

function getDirectoryPath(dir: DirectoryKey): string {
  const base = FileSystem.documentDirectory;

  if (!base) {
    throw new Error("Document directory unavailable");
  }

  switch (dir) {
    case "images":
      return `${base}picked_images/`;
    case "documents":
      return `${base}picked_documents/`;
    default:
      throw new Error(`Unknown directory key: ${dir}`);
  }
}

export async function ensurePersistentDir(
  PERSISTENT_DIR: string,
): Promise<void> {
  const info = await FileSystem.getInfoAsync(PERSISTENT_DIR);
  console.log("getInfoSec Image service: ", info);
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

  // const path = DIRECTORY_PATHS[dir];
  const path = getDirectoryPath(dir);

  await ensurePersistentDir(path);

  const newFileName = `${Date.now()}-${file.name}`;
  const newPath = `${path}${newFileName}`;

  console.log("DIR:", dir);
  console.log("PATH:", path);

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
    // const path = DIRECTORY_PATHS[key];
    const path = getDirectoryPath(key);

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
    // const path = DIRECTORY_PATHS[key];
    const path = getDirectoryPath(key);

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
