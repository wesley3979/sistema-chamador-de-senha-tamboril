const removeSpecialChars = (str) => {
    let newStr = str.normalize("NFD")
    var specialChars = /[^a-zA-Z0-9 ]/g;
    return newStr.replace(specialChars, "").replace(/\s/g, "");
}

module.exports = removeSpecialChars;
