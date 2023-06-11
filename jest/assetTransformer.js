// https://github.com/facebook/jest/issues/2663
import path from "path";

export default {
  process(_, filename) {
    const content = JSON.stringify(path.basename(filename));
    return {
      code: `module.exports = ${content};`,
    };
  },
};
