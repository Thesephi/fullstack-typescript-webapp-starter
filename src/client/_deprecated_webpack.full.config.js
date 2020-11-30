const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const isDevelopment = process.env.NODE_ENV !== "production";
const mode = isDevelopment ? "development" : "production";

console.log(`webpack operating under mode \`${mode}\``);

module.exports = {

    mode,
    watch: process.env.WATCH === "true",

    target: "web",
    entry: {
        main: [
        "webpack-hot-middleware/client?path=__webpack_hmr&timeout=2000&overlay=false",
        path.resolve(__dirname, "./main.tsx")
        // "src/client/main.tsx"
        ]
    },

    output: {
        // path: path.resolve(__dirname, "../../build/public"),
        // filename: "js/main.js"
        path: process.env.WEBPACK_CLIENT_APP_OUTPUT_DIR,
        filename: process.env.WEBPACK_CLIENT_APP_OUTPUT_FILENAME,
        publicPath: "/"
    },

    devServer: {
        contentBase: path.resolve(__dirname, "../../build/public"),
        hot: true
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        // Add '.js' is so that React itself can be compiled (though this is not required during prod).
        extensions: [".ts", ".tsx", ".js"],
        alias: {
        shared: path.resolve(__dirname, "shared/")
        }
    },

    module: {
        rules: [
            {
                // test: /\.ts(x?)$/,
                test: /\.(t|j)s(x?)$/,
                // include: path.resolve(process.cwd(), "src/client"),
                exclude: /node_modules/,
                use: [
                    isDevelopment && {
                    loader: "babel-loader",
                    options: { plugins: ["react-refresh/babel"] }
                    },
                    {
                    loader: "ts-loader",
                    options: { transpileOnly: true }
                    }
                ].filter(Boolean)
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                // Creates `style` nodes from JS strings
                "style-loader",
                // Translates CSS into CommonJS
                "css-loader",
                // Compiles Sass to CSS
                "sass-loader"
                ]
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf|node)$/,
                loader: "file-loader",
                options: {
                outputPath: "fonts"
                }
            },
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader"
            }
        ]
    },

    plugins: [
        new webpack.EnvironmentPlugin({
        NODE_ENV: mode,
        APP_NAME: process.env.APP_NAME
        }),
        new HtmlWebpackPlugin({
            filename: path.resolve(__dirname, "../../build/server/view-templates/index.html"),
            template: path.resolve(__dirname, "../server/view-templates/index.html"),
            publicPath: "/"
        }),
        isDevelopment && new webpack.HotModuleReplacementPlugin(), // disable if using webpack-dev-server
        isDevelopment && new (require("@pmmmwh/react-refresh-webpack-plugin"))({
            overlay: {
                sockIntegration: "whm",
            }
        })
    ]

};
