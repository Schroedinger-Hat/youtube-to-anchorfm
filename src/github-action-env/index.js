const defaultValues = {
    EPISODE_PATH: ".",
    ANCHOR_EMAIL: "",
    ANCHOR_PASSWORD: "",
    UPLOAD_TIMEOUT: 60 * 5 * 1000,
    SAVE_AS_DRAFT: "false",
    LOAD_THUMBNAIL: "false",
    IS_EXPLICIT: "false",
    URL_IN_DESCRIPTION: "false",
    POSTPROCESSOR_ARGS: ""
}

function getEnvironmentVariable(environmentVariableName) {
    return process.env[environmentVariableName] || defaultValues[environmentVariableName];
}

module.exports = {
    EPISODE_PATH: getEnvironmentVariable("EPISODE_PATH") + "/episode.json",
    ANCHOR_EMAIL: getEnvironmentVariable("ANCHOR_EMAIL"),
    ANCHOR_PASSWORD: getEnvironmentVariable("ANCHOR_PASSWORD"),
    UPLOAD_TIMEOUT: getEnvironmentVariable("UPLOAD_TIMEOUT"),
    SAVE_AS_DRAFT: getEnvironmentVariable("SAVE_AS_DRAFT"),
    LOAD_THUMBNAIL: getEnvironmentVariable("LOAD_THUMBNAIL"),
    IS_EXPLICIT: getEnvironmentVariable("IS_EXPLICIT"),
    URL_IN_DESCRIPTION: getEnvironmentVariable("URL_IN_DESCRIPTION"),
    POSTPROCESSOR_ARGS: getEnvironmentVariable("POSTPROCESSOR_ARGS")
};
