/**
 * @type {import('vite').UserConfig}
 */
import commonjsExternals from "vite-plugin-commonjs-externals";
export default {
  server: {
    port: 3000,
  },
  base: "",
  plugins: [
    commonjsExternals({
      externals: ["path", "robocol"],
    }),
  ],
};
