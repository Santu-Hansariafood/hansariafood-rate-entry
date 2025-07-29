import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

export function generateWeeklyRatePdf({ userName, weekDates, groupedCompanies }) {
  const header = [
    { text: "Company", style: "tableHeader" },
    { text: "Location", style: "tableHeader" },
    ...weekDates.map((date) => ({
      text: new Date(date).toLocaleDateString("en-GB", { weekday: "short", day: "2-digit" }),
      style: "tableHeader",
    })),
  ];

  const body = [header];

  groupedCompanies.forEach((company) => {
    const { name, locations } = company;

    locations.forEach((location, index) => {
      const row = [];

      if (index === 0) {
        row.push({ text: name, rowSpan: locations.length, style: "companyCell" });
      } else {
        row.push({});
      }

      row.push({ text: location });

      weekDates.forEach(() => {
        row.push({
          text: "", // Empty box
          border: [true, true, true, true],
        });
      });

      body.push(row);
    });
  });

  const docDefinition = {
    content: [
      { text: `Weekly Rate Sheet for ${userName}`, style: "title", margin: [0, 0, 0, 10] },
      {
        text: `Week: ${new Date(weekDates[0]).toLocaleDateString()} - ${new Date(
          weekDates[6]
        ).toLocaleDateString()}`,
        style: "subtitle",
        margin: [0, 0, 0, 10],
      },
      {
        table: {
          headerRows: 1,
          widths: ["auto", "auto", ...weekDates.map(() => "auto")],
          body,
        },
        layout: {
          fillColor: (rowIndex) => (rowIndex === 0 ? "#f3f3f3" : null),
        },
      },
    ],
    styles: {
      title: { fontSize: 16, bold: true },
      subtitle: { fontSize: 12, italics: true },
      tableHeader: { bold: true, fillColor: "#eeeeee", margin: [0, 5, 0, 5] },
      companyCell: { bold: true, color: "#1d4ed8" },
    },
    defaultStyle: { fontSize: 9 },
    pageSize: "A4",
    pageOrientation: "landscape",
  };

  pdfMake.createPdf(docDefinition).download(`Weekly_Rate_Sheet_${userName}.pdf`);
}
