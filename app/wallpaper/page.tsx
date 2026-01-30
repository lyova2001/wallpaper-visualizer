import dynamic from "next/dynamic";

const CameraCapture = dynamic(
  () => import("../_components/CameraCapture/CameraCapture")
);

export default function WallpaperPage() {
  return <CameraCapture />;
}