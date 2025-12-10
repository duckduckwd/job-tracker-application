import styles from "../example-code/for-global.module.css";
import desktop from "../example-code/glassmorphism-desktop.module.css";
import glass from "../example-code/glassmorphism-utils.module.css";

const DesktopScreen = () => {
  return (
    <>
      <div className={styles["app-bg"]} />
      <div
        className={desktop["desktop-screen"]}
        style={{ background: "transparent" }}
      >
        <div className={desktop["desktop-shell"]}>
          <section
            className={`${glass["glass-card"]} ${glass["glass-card-strong"]} ${desktop["desktop-form-card"]}`}
          >
            {/* title, stepper, .desktop-fields-grid with .glass-field inputs */}
            <div className={desktop["desktop-cta-row"]}>
              <button
                className={`${glass["glass-button"]} ${glass["glass-button--primary"]}`}
              >
                Continue
              </button>
              <button className={glass["glass-button"]}>
                Save and finish later
              </button>
            </div>
          </section>

          <aside
            className={`${glass["glass-card"]} ${desktop["desktop-side-card"]}`}
          >
            {/* job summary, status, or decorative illustration */}
          </aside>
        </div>
      </div>
    </>
  );
};

export default DesktopScreen;
