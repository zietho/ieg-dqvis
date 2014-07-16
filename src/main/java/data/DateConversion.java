package data;

import java.io.BufferedReader;
        import java.io.BufferedWriter;
        import java.io.File;
        import java.io.FileNotFoundException;
        import java.io.FileReader;
        import java.io.FileWriter;
        import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;

public class DateConversion {
    private String inputFilePath;
    private String outputFilePath;
    private String delimiter = " "; // by tab
    private ArrayList<ArrayList<String>> data = new ArrayList<ArrayList<String>>();


    public static void main(String args[]) {
        DateConversion missingValues = new DateConversion();
        missingValues.setDelimiter(",");
        missingValues.setInputFilePath("src/main/resources/data/01_raw_data_set1.csv");
        missingValues.setOutputFilePath("src/main/resources/data/01_raw_data_set1_preprocessed3.csv");
        missingValues.convert();
        missingValues.listData();
    }

    public String getInputFilePath() {
        return inputFilePath;
    }

    public void setInputFilePath(String inputFilePath) {
        this.inputFilePath = inputFilePath;
    }

    public String getOutputFilePath() {
        return outputFilePath;
    }

    public void setOutputFilePath(String outputFilePath) {
        this.outputFilePath = outputFilePath;
    }

    public void setDelimiter(String delimiter) {
        this.delimiter = delimiter;
    }


    public void listData() {
        int line = 0;
        for (ArrayList<String> d : data) {
            System.out.print(line + ": ");
            for (String out : d) {
                System.out.print(out + " ");
            }
            System.out.println("");
            line++;
        }
    }

    public void convert() {
        File inputFile = new File(this.inputFilePath);
        BufferedReader bufferedReader = null;
        if (outputFilePath == "" || outputFilePath == null)
            outputFilePath = "output_withMissingValues.data";
        File outputFile = new File(outputFilePath);
        if (!outputFile.exists()) {
            try {
                outputFile.createNewFile();
            } catch (IOException e1) {
                e1.printStackTrace();
            }
        }
        BufferedWriter bufferedWriter = null;

        try {
            bufferedReader = new BufferedReader(new FileReader(inputFile));
            bufferedWriter = new BufferedWriter(new FileWriter(outputFile));
            String line;

            int i = 0;

            while ((line = bufferedReader.readLine()) != null && i<100) {
                if(i>0) {
                    List<String> splitedLine = Arrays.asList(line.split(delimiter)); //get date column
                    DateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"); //set format
                    String converted = df.format(new Date((Long.parseLong(splitedLine.get(0))))); //convert
                    splitedLine.set(0, converted); // exchange values;
                    line = splitedLine.toString();
                    line = line.substring(1,line.length()-1);
                }
                bufferedWriter.write(line);
                bufferedWriter.newLine();
                i++;
            }

            bufferedWriter.flush();
            bufferedWriter.close();
            bufferedReader.close();
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (bufferedReader != null) {
                try {
                    bufferedReader.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}