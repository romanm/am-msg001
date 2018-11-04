package org.algoritmed.ammsg001.excel;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.poi.EncryptedDocumentException;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.CreationHelper;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.poi.util.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.fasterxml.jackson.databind.ObjectMapper;

//@PropertySource(value = "classpath:email.properties", encoding="UTF-8")
@Controller
public class ExcelRest {
	// https://www.callicoder.com/java-write-excel-file-apache-poi/
	private static final Logger logger = LoggerFactory.getLogger(ExcelRest.class);

	private InputStream buildExcel(HttpServletResponse response, Map<String, Object> excelData) throws EncryptedDocumentException, InvalidFormatException, IOException {
		logger.info("\n\n-- 48 -- "
				+ "\n"
				+ excelData
				);
		Workbook wb = buildReport(excelData);
		ByteArrayOutputStream bos = new ByteArrayOutputStream();
		wb.write(bos);
		byte[] barray = bos.toByteArray();
		return new ByteArrayInputStream(barray);
	}
	
	private void addPhysician(Sheet sheet , Map<String, Object> excelData) {
		if(excelData.containsKey("physician")) {
			@SuppressWarnings("unchecked")
			Map<String, Object> physician = (Map<String, Object>) excelData.get("physician");
			int rowNr = Integer.parseInt(""+physician.get("r"));
			int cellNr = Integer.parseInt(""+physician.get("c"));
			Row row = sheet.createRow(rowNr);
			Cell cell = row.createCell(cellNr);
			cell.setCellValue(""+physician.get("d"));
			Cell cell2 = row.createCell(0);
			cell2.setCellValue("Лікар");
		}
	}

	private Workbook buildReport(Map<String, Object> excelData) throws IOException, InvalidFormatException {
		Workbook wb = WorkbookFactory.create(new File(serverDataFiles+filePath));
		CellStyle cellDateStyle = wb.createCellStyle();
		CreationHelper createHelper = wb.getCreationHelper();
		cellDateStyle.setDataFormat(
				createHelper.createDataFormat().getFormat("dd mmm. yyyy"));
		Sheet sheet = wb.getSheetAt(0);
		addPhysician(sheet,excelData);
		@SuppressWarnings("unchecked")
		Map<String, Object> rcData = (Map<String, Object>) excelData.get("rcData");
		System.err.println(rcData);
		for (String keyR : (Set<String>) rcData.keySet()) {
			int rowNr = Integer.parseInt(keyR);
			Row row = sheet.createRow(rowNr);
			@SuppressWarnings("unchecked")
			Map<String, Object> cells = (Map<String, Object>)rcData.get(keyR);
			for (String keyC : cells.keySet()) {
				int cellNr = Integer.parseInt(keyC);
				Cell cell = row.createCell(cellNr);
				Object object = cells.get(keyC);
				if(object instanceof Integer) {
					cell.setCellValue((Integer)object);
				}else {
					String stringValue = ""+object;
					if(stringValue.contains("=")) {
						String stringFormula = stringValue.substring(1).replace(";", ",");
						if(stringFormula.contains("DATE")) {
							cell.setCellFormula(stringFormula);
							cell.setCellStyle(cellDateStyle);
						}
					}else {
						cell.setCellValue(stringValue);
					}
				}
			}
			System.err.println(cells.keySet());
		}

		/*
		Row row = sheet.createRow(2);
		Cell cell = row.createCell(0);
		cell.setCellValue(1);
		Workbook wb = WorkbookFactory.create(inp);
		Row row = sheet.getRow(2);
		Cell cell = row.getCell(3);
		if (cell == null)
			cell = row.createCell(3);
		cell.setCellType(CellType.STRING);
		cell.setCellValue("a test");
		return inp;
		 * */
		return wb;
	}

	@GetMapping(
			value = "/r/excel1",
			produces = {"application/vnd.ms-excel"}
			)
	public @ResponseBody byte[] getImageWithMediaType(HttpServletRequest request, HttpServletResponse response) throws IOException, EncryptedDocumentException, InvalidFormatException {
		String data = request.getParameter("data");
		System.out.println("---------70----------");
		Map<String, Object> map = stringToMap(data);

		InputStream inp = buildExcel(response, map);
		return IOUtils.toByteArray(inp);
	}

	private @Value("${am.configDir}") String serverDataFiles;
	String filePath = "excel_file_sample.xlsx";
	@SuppressWarnings("unused")
	private InputStream buildExcel(HttpServletResponse response) throws FileNotFoundException {
		response.setHeader("Content-disposition", "attachment; filename=excel_file_sample_"+123+".xlsx");
		InputStream inp = new FileInputStream(serverDataFiles+filePath);
		return inp;
	}

	@Autowired protected	ObjectMapper objectMapper;
	@SuppressWarnings("unchecked")
	protected Map<String, Object> stringToMap(String protocolDoc) {
		Map<String, Object> map = null;
		try {
			map = objectMapper.readValue(protocolDoc, Map.class);
		} catch (IOException e) {
			e.printStackTrace();
		}
		if(map==null)
			map = new HashMap<>();
		return map;
	}

}
