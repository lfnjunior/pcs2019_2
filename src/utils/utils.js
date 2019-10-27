module.exports = {
  formatDate(date) {
    var d = new Date(date),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();
    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;
    return [year, month, day].join("-");
  },

  replaceStr(json, oldStr, newStr) {
    let str = JSON.stringify(json);
    for (let i = 0; i < oldStr.length; i++) {
      str = str.replace(new RegExp(oldStr[i], "g"), newStr[i]);
    }
    return JSON.parse(str);
  }
};
