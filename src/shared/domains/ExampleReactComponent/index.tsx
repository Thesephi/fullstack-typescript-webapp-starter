import React, { FC } from "react";
import Box from "@mui/material/Box";
import "./styles.scss";

interface IProps {
  foo: string
}

export const ExampleReactComponent: FC<IProps> = ({ foo }) => {
  return <div id="example-container" style={{
    display: "flex",
    height: "100%",
    justifyContent: "center",
    alignItems: "center"
  }}>
    <Box
      sx={{
        width: 300,
        height: 300,
        color: "black",
        padding: "20px",
        boxShadow: "0px 0px 20px 5px #AAA",
        fontFamily: "Roboto, sans-serif",
        backgroundColor: "#ededed",
        borderRadius: "2px",
        // backgroundColor: "primary.dark",
        // "&:hover": {
        //   backgroundColor: "primary.main",
        //   opacity: [0.9, 0.8, 0.7],
        // },
      }}
    >
      <span>Hello, {foo}</span>
      {/* <span>{foo}</span> */}
    </Box>
  </div>
}