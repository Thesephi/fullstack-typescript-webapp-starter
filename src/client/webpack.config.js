const path = require("path");

const mode = process.env.NODE_ENV || "production";

console.log(`webpack operating under mode \`${mode}\``);

module.exports = {

    mode,
    watch: process.env.WATCH === "true",

    entry: "./src/client/main.tsx",

    output: {
        // path: path.resolve(__dirname, "../../build/public"),
        // filename: "js/main.js"
        path: process.env.WEBPACK_OUTPUT_DIR,
        filename: process.env.WEBPACK_OUTPUT_FILENAME
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js"] // '.js' is so that React itself can be compiled (though this is not required during prod)
    },

    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "ts-loader"
                    }
                ]
            },
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader"
            }
        ]
    },

    /* the following optimization is disabled for the sake of simplicity for the exercise */
    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
    // externals: {
    //     "react": "React",
    //     "react-dom": "ReactDOM"
    // }
};
