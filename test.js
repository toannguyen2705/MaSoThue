export const getCompanyDataFromMST = async (taxID) => {
  // const browser = await puppeteer.launch({
  //   headless: false,
  //   ignoreHTTPSErrors: true,
  //   args: [`--window-size=1920,1080`],
  //   devtools: true,
  //   defaultViewport: {
  //     width: 1920,
  //     height: 1080,
  //   },
  // });

  const browser = await puppeteer.connect({
    browserWSEndpoint: process.env.BROWSERLESS_WS_URL || "ws://localhost:3333",
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
  );
  await page.goto("https://masothue.com");

  await page.waitForSelector(".tax-search input.search-field");

  await page.type(".tax-search input.search-field", taxID);

  await page.waitForSelector(".table-taxinfo");

  const companyName = await page.$$eval(".table-taxinfo thead tr", (trs) => {
    let result = "";
    Array.from(trs, (tr) => {
      const th = tr.querySelector("th");
      result = th.innerText?.trim();
    });
    return result;
  });

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
          "startDay",
          "ownerBy",
          "legacyType",
          "status",
        ];

        const capitalizeFirstLetterOfEachWord = (str) => {
          let splitStr = str?.toLowerCase()?.split(" ");
          for (let i = 0; i < splitStr?.length; i++) {
            splitStr[i] =
              splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
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
          case "fa fa-calendar":
            let contentArrayCalendar = Array.from(tds, (td) =>
              td?.innerText?.trim()
            );
            const contentSplit = contentArrayCalendar[1]?.split("-");
            reusltInfoCompany[
              columns[6]
            ] = `${contentSplit[2]}/${contentSplit[1]}/${contentSplit[0]}`;
          case "fa fa-users":
            reusltInfoCompany[columns[7]] =
              capitalizeFirstLetterOfEachWord(text);
          case "fa fa-building":
            reusltInfoCompany[columns[8]] = text;
          case "fa fa-info":
            reusltInfoCompany[columns[9]] = Array.from(tds, (td) =>
              td?.innerText?.trim()
            )[1].includes("Ngừng Hoạt Động")
              ? "Ngừng hoạt động"
              : "Đang hoạt động";
          default:
        }
      });

      return reusltInfoCompany;
    }
  );

  const dataReusltBusinessTypes = await page.$$eval(
    ".table tbody tr",
    (trs) => {
      const capitalizeFirstLetterOfEachWord = (str) => {
        let splitStr = str?.toLowerCase()?.split(" ");
        for (let i = 0; i < splitStr?.length; i++) {
          splitStr[i] =
            splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
        }
        return splitStr?.join(" ");
      };

      const reusltBusinessTypes = {};
      Array.from(trs, (tr, i) => {
        const tds = tr.querySelectorAll("td");
        const contentArray = Array.from(tds, (td) => td);

        if (contentArray?.length > 0) {
          const innerHTML = contentArray[0].innerHTML;
          const regex = new RegExp(/<strong>/, "i");
          if (regex.test(innerHTML)) {
            reusltBusinessTypes.code = capitalizeFirstLetterOfEachWord(
              contentArray[0].innerText.trim()
            );
            reusltBusinessTypes.content = capitalizeFirstLetterOfEachWord(
              contentArray[1].querySelector("a").innerText.trim()
            );
          }
        }
      });
      return reusltBusinessTypes;
    }
  );

  await browser.close();

  return {
    companyName: companyName?.toUpperCase(),
    ...dataReusltInfoCompany,
    ...dataReusltBusinessTypes,
  };
};
