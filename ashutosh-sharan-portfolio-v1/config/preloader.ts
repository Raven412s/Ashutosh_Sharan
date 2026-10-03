/**
 * Preloader and Animation Configuration
 */
export const PRELOADER_CONFIG = {
  /**
   * Set to true to enable preloader on route transitions / direct page loads.
   */
  ENABLED: true,

  /**
   * Set to true to re-run the preloader on every browser reload during development.
   * In production (or when set to false), the preloader runs only once per browser tab session.
   */
  FORCE_IN_DEV: true,

  /**
   * Session storage key used to track if preloader has already played in the current tab session.
   */
  STORAGE_KEY: "ashutosh_portfolio_preloader_played",
};
