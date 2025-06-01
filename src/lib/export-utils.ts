import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import "jspdf-autotable"

// Extend jsPDF type to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

export interface ExportData {
  headers: string[]
  data: any[][]
  title: string
  filename: string
}

export const exportToExcel = (exportData: ExportData) => {
  const ws = XLSX.utils.aoa_to_sheet([exportData.headers, ...exportData.data])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, exportData.title)
  XLSX.writeFile(wb, `${exportData.filename}.xlsx`)
}

export const exportToCSV = (exportData: ExportData) => {
  const csvContent = [
    exportData.headers.join(","),
    ...exportData.data.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `${exportData.filename}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const exportToPDF = (exportData: ExportData) => {
  const doc = new jsPDF()

  // Add title
  doc.setFontSize(16)
  doc.text(exportData.title, 14, 22)

  // Add date
  doc.setFontSize(10)
  doc.text(`Generado el: ${new Date().toLocaleDateString("es-ES")}`, 14, 30)

  // Add table
  doc.autoTable({
    head: [exportData.headers],
    body: exportData.data,
    startY: 40,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  })

  doc.save(`${exportData.filename}.pdf`)
}

export const formatDateForExport = (date: string | Date) => {
  return new Date(date).toLocaleDateString("es-ES")
}

export const formatNumberForExport = (num: number, decimals = 2) => {
  return num.toFixed(decimals)
}
