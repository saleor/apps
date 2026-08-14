import styles from "./store-readiness-checklist.module.css";

const Bone = ({ className }: { className?: string }) => (
  <span className={`${styles.bone} ${className ?? ""}`} aria-hidden />
);

const TaskRowSkeleton = ({
  titleClass,
  detailClass,
}: {
  titleClass: string;
  detailClass?: string;
}) => (
  <li className={styles.task}>
    <div className={styles.taskHeader}>
      <div className={styles.taskLeading}>
        <Bone className={styles.boneCircle} />
      </div>
      <div className={styles.taskContent}>
        <Bone className={`${styles.boneLine} ${titleClass}`} />
        {detailClass ? <Bone className={`${styles.boneLineShort} ${detailClass}`} /> : null}
      </div>
    </div>
  </li>
);

/**
 * Static, content-shaped placeholder (Geist “no animation”).
 * Mirrors the two-card checklist so the swap does not shift layout.
 */
export const StoreReadinessSkeleton = () => (
  <div
    className={styles.layout}
    data-test-id="store-readiness-loading"
    aria-busy="true"
    aria-label="Loading…"
  >
    <div className={`${styles.card} ${styles.elevated}`}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <Bone className={styles.boneTitle} />
          <Bone className={styles.boneBadge} />
          <Bone className={styles.boneProgress} />
        </div>
        <Bone className={styles.boneSubtitle} />
      </div>
      <div className={styles.sectionHeader}>
        <Bone className={styles.boneSection} />
      </div>
      <ul className={`${styles.taskList} ${styles.taskListAfterSection}`}>
        <TaskRowSkeleton titleClass={styles.boneW72} detailClass={styles.boneW54} />
        <TaskRowSkeleton titleClass={styles.boneW64} detailClass={styles.boneW48} />
        <TaskRowSkeleton titleClass={styles.boneW56} detailClass={styles.boneW40} />
        <TaskRowSkeleton titleClass={styles.boneW48} />
      </ul>
      <div className={styles.sectionHeader}>
        <Bone className={styles.boneSection} />
      </div>
      <ul className={`${styles.taskList} ${styles.taskListAfterSection}`}>
        <TaskRowSkeleton titleClass={styles.boneW68} detailClass={styles.boneW52} />
        <TaskRowSkeleton titleClass={styles.boneW60} detailClass={styles.boneW44} />
      </ul>
      <div className={styles.footer}>
        <Bone className={styles.boneFooter} />
        <Bone className={styles.boneFooterAction} />
      </div>
    </div>

    <aside className={`${styles.card} ${styles.elevated} ${styles.paperCard}`}>
      <div className={styles.paperBrand}>
        <Bone className={styles.boneLogo} />
        <div>
          <Bone className={styles.boneTitle} />
          <Bone className={styles.boneSubtitle} />
        </div>
        <div className={styles.paperHero} />
      </div>
      <ul className={styles.taskList}>
        <TaskRowSkeleton titleClass={styles.boneW70} detailClass={styles.boneW50} />
        <TaskRowSkeleton titleClass={styles.boneW58} detailClass={styles.boneW42} />
        <TaskRowSkeleton titleClass={styles.boneW64} detailClass={styles.boneW46} />
      </ul>
      <div className={styles.paperFooter}>
        <Bone className={styles.boneFooterAction} />
      </div>
    </aside>
  </div>
);
