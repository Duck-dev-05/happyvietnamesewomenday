import PhotoSlideshow from "./PhotoSlideshow";
import { photos } from "@/app/data/photos";
import styles from "./PhotoLibrary.module.css";

export default function PhotoSlideshowSection() {
  if (photos.length === 0) return null;
  return (
    <section id="home" className={styles.heroSection} aria-label="Kỷ niệm và lời chúc ngày 20/10">
      <PhotoSlideshow />
    </section>
  );
}
