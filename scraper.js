const scrapeCategory = async (browser, url) =>
  new Promise(async (resolve, reject) => {
    try {
      let page = await browser.newPage();
      console.log(">> Mở tab mới...");

      await page.goto(url);
      await page.waitForSelector("#search");
      await page.focus("#search");
      await page.type("#search", "kế toán");
      await page.click(
        "#page > nav > div > form > div > div.input-group-btn > button"
      );

      await page.waitForNavigation();
      const currentUrl = page.url();
      console.log(currentUrl);

      //tạo page nhập chữ kế toán, click tìm kiếm, get current url, gán lên url phái trên
      for (let k = 1; k <= 2; k++) {
        if (k === 1) {
          page.goto(currentUrl);

          await page.waitForSelector(
            `#main > section > div > nav > div > ul > li:nth-child(${k}) > span`
          );
        } else {
          await page.click(
            `#main > section > div > nav > div > ul > li:nth-child(${k}) > a`
          );
          await page.waitForSelector(
            `#main > section > div > nav > div > ul > li:nth-child(${k}) > span`
          );
        }

        let taxListing = await page.$$(
          "#main > section > div > div.tax-listing > div"
        );

        for (let j = 2; j <= taxListing.length * 2; j = j + 2) {
          await page.click(
            `#main > section > div > div.tax-listing > div:nth-child(${j}) > h3 > a`
          );
          await page.waitForTimeout(1000);
          const companyName = await page.$$eval(
            ".table-taxinfo thead tr",
            (trs) => {
              let result = "";
              Array.from(trs, (tr) => {
                const th = tr.querySelector("th");
                result = th.innerText?.trim();
              });
              return result;
            }
          );
          const dataReusltInfoCompany = await page.$$eval(
            ".table-taxinfo tbody tr",
            (trs) => {
              const reusltInfoCompany = {};
              Array.from(trs, (tr) => {
                const columns = [
                  "companyNameEn",
                  "companyNameShort",
                  "taxID",
                  "address",
                  "owners",
                  "phone",
                ];
                const capitalizeFirstLetterOfEachWord = (str) => {
                  let splitStr = str?.toLowerCase()?.split(" ");
                  for (let i = 0; i < splitStr?.length; i++) {
                    splitStr[i] =
                      splitStr[i].charAt(0).toUpperCase() +
                      splitStr[i].substring(1);
                  }
                  return splitStr?.join(" ");
                };
                const tds = tr.querySelectorAll("td");

                const eleI = tds[0].querySelector("i");
                const text = tds[1]?.innerText?.trim();
                const classNameOfEleI = eleI?.className;

                switch (classNameOfEleI) {
                  case "fa fa-globe":
                    reusltInfoCompany[columns[0]] =
                      capitalizeFirstLetterOfEachWord(text);
                  case "fa fa-reorder":
                    reusltInfoCompany[columns[1]] = text;
                  case "fa fa-hashtag":
                    reusltInfoCompany[columns[2]] = text;
                  case "fa fa-map-marker":
                    reusltInfoCompany[columns[3]] =
                      capitalizeFirstLetterOfEachWord(text);
                  case "fa fa-user":
                    reusltInfoCompany[columns[4]] =
                      capitalizeFirstLetterOfEachWord(text);
                  case "fa fa-phone":
                    reusltInfoCompany[columns[5]] = text;
                  default:
                }
              });

              return reusltInfoCompany;
            }
          );
          console.log(companyName);
          console.log(dataReusltInfoCompany);
          await page.goto(currentUrl.concat(`&page=${k}`));
        }
      }
      resolve();
    } catch (error) {
      console.log("Lỗi ở scrape category: " + error);
      reject(error);
    }
  });

module.exports = {
  scrapeCategory,
};
