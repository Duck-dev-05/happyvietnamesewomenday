import styles from "./PageShell.module.css";
type SectionHeadingProps = { description: string; title: string; className?: string; };
export default function SectionHeading({ description, title, className = "" }: SectionHeadingProps) {
  return <div className={`${styles.heading} ${className}`}><p>{description}</p><h2>{title}</h2><span aria-hidden="true">✳</span></div>;
}
