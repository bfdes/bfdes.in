// https://github.com/istanbuljs/v8-to-istanbul/issues/198

export default (value) => typeof value === "string" || value instanceof String;
