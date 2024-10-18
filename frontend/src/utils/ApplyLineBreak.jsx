import React from "react";

function ApplyLineBreak({ string }) {
  return string.split(/(?:\r\n|\r|\n)/g).map((line, i, arr) => (
    <span key={i}>
      {line}
      {arr.length - 1 === i ? null : <br />}
    </span>
  ));
}

export default ApplyLineBreak;
