package data;

/**
 * Created by evolution on 16/07/2014.
 */

import core.TemporalColumn;
import core.TemporalData;
import core.TemporalValue;
import ieg.prefuse.data.ParentChildNode;
import ieg.util.xml.JaxbMarshaller;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import prefuse.data.Schema;
import prefuse.data.Table;
import prefuse.data.column.Column;
import prefuse.data.expression.ColumnExpression;
import prefuse.data.expression.ComparisonPredicate;
import prefuse.data.expression.NumericLiteral;
import prefuse.data.io.DataIOException;
import timeBench.action.analytical.GranularityAggregationAction;
import timeBench.calendar.Calendar;
import timeBench.calendar.CalendarFactory;
import timeBench.calendar.Granularity;
import timeBench.calendar.JavaDateCalendarManager;
import timeBench.data.*;
import timeBench.data.io.TextTableTemporalDatasetReader;
import timeBench.data.io.schema.TemporalDataColumnSpecification;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/**
 * Created by evolution on 07/07/2014.
 */
public class CsvDAO implements DataDAO{
    private static CsvDAO instance = null;
    final Logger logger = LoggerFactory.getLogger(CsvDAO.class);
    private String dataPath = "";
    private String dataSpecPath = "";
    private TemporalDataset dataset;
    private core.Schema schema;
    private GranularityAggregationTree aggregatedDataset;
    private Schema datasetSchema;


    public static CsvDAO getInstance(String dataPath, String dataSpecPath) {
        if (instance == null)
            instance = new CsvDAO(dataPath, dataSpecPath);
        return instance;
    }


    private CsvDAO(String dataPath, String dataSpecPath){
        this.dataPath = dataPath;
        this.dataSpecPath= dataSpecPath;
        this.dataset = this.readData(dataPath, dataSpecPath);
        this.datasetSchema = this.dataset.getDataColumnSchema();
        //TODO fix bug with current test data
        //this.aggregatedDataset = this.aggregate();
    }

    public TemporalDataset readData(){
        return readData(this.dataPath, this.dataSpecPath);
    }

    public TemporalDataset readData(String dataPath, String dataSpecPath){
        TemporalDataColumnSpecification spec = (TemporalDataColumnSpecification) JaxbMarshaller
                .load(dataSpecPath, TemporalDataColumnSpecification.class);
        TextTableTemporalDatasetReader reader = new TextTableTemporalDatasetReader(spec);
        TemporalDataset tmpds = null;

        try {
            tmpds = reader.readData(dataPath);
        } catch (DataIOException e) {
            logger.error("DataIOException thrown with the following error: {}", e.toString());
        } catch (TemporalDataException e) {
            logger.error("TemporalDataException with the following error message: {}", e.toString());
        }

        return tmpds;
    }

    public TemporalData read(){
        TemporalData temporalData = new TemporalData();
        Schema schema = dataset.getDataColumnSchema();

        for(int i=0; i<schema.getColumnCount(); i++){
            temporalData.add(this.read(this.datasetSchema.getColumnName(i)));
        }

        return temporalData;
    }

    public TemporalColumn read(String column){
        return this.readTimeSlice(0, dataset.getTemporalObjectTable().getRowCount()-1, column);
    }

    public TemporalData readTimeSlice(int fromIndex, int toIndex){
        TemporalData temporalData = new TemporalData();
        for(int i=0; i<datasetSchema.getColumnCount(); i++){
            temporalData.add(readTimeSlice(fromIndex, toIndex, datasetSchema.getColumnName(i)));
        }

        return temporalData;
    }

    public TemporalColumn readTimeSlice(int fromIndex, int toIndex, String column){
        TemporalColumn temporalColumn = new TemporalColumn(column);
        TemporalElementStore temporalElementStore = dataset.getTemporalElements();

        if(column != null && !column.equals("")){
            Table table = dataset.getTemporalObjectTable();

            //first get the column and convert it to an array list
            Column dataColumn = table.getColumn(column);
            Column missingDataColumn = table.getColumn(column+".MissingData");
            Column invalidDataColumn = table.getColumn(column+".InvalidData");

            for(int i=0; i<dataColumn.getRowCount(); i++){
                double dataValue = dataColumn.getDouble(i);
                double qualityValue =0;
                if(missingDataColumn != null && invalidDataColumn != null){
                    qualityValue = (missingDataColumn.get(i)==1 || invalidDataColumn.get(i)==1) ? 1 : 0;
                }
                long inf = temporalElementStore.getTemporalElementByRow(i).getInf();
                long sup = temporalElementStore.getTemporalElementByRow(i).getSup();
                long dateValue = (inf == sup) ? inf : 0;

                if(inf != sup) {
                    logger.warn("inf: {} and sup: {} are not the same", inf, sup);
                }

                temporalColumn.add(new TemporalValue(dateValue, dataValue, qualityValue));
            }
        }

        return temporalColumn;
    }

    public GranularityAggregationTree aggregate(){
        Calendar calendar = JavaDateCalendarManager.getSingleton().getDefaultCalendar();
        GranularityAggregationAction timeAggregationAction = new GranularityAggregationAction(this.dataset,
                new Granularity[] {
                        CalendarFactory.getSingleton().getGranularity(calendar,"Top","Top"),
                        CalendarFactory.getSingleton().getGranularity(calendar,"Day","Top"),
                        CalendarFactory.getSingleton().getGranularity(calendar,"Hour","Day"),
                        CalendarFactory.getSingleton().getGranularity(calendar,"Minute","Hour") },
                -1.0);
        timeAggregationAction.run(0);
        return timeAggregationAction.getGranularityAggregationTree();
    }

    public core.Schema getColumnNames(){
        if(schema == null) {
            core.Schema schema = new core.Schema();
            int numberOfColumns = (int) Math.ceil((this.datasetSchema.getColumnCount() - 2.0) / 3.0);
            //cut off the first 3 columns as they are id... temp something..
            for (int i = 0; i < numberOfColumns; i++) {
                schema.addColumn(new core.Column(this.datasetSchema.getColumnName(i)));
            }
            logger.info("available columns {}", schema.getColumns().toString());
            this.schema = schema;
        }

        return this.schema;
    }

    public TemporalColumn readAggregated(String column, int granularity){
        List<String> columns = new ArrayList<String>();
        columns.add(column);
        return  readAggregated(columns, granularity);
    }

    public TemporalColumn readAggregated(String column, int granularity, List<String> indicators){
        List<String> columns = new ArrayList<String>();
        columns.add(column);
        return  readAggregated(columns, granularity, indicators);
    }


    public TemporalColumn readAggregated(int granularity){
        List<String> columns = new ArrayList<String>();
        int numberOfColumns = (int) Math.ceil((this.datasetSchema.getColumnCount() - 2.0) / 3.0);
        for(int i=0; i<numberOfColumns;i++) {
            columns.add(this.datasetSchema.getColumnName(i));
        }

        return readAggregated(columns, granularity);
    }

    public TemporalColumn readAggregated(int granularity, List<String> indicators){
        List<String> columns = new ArrayList<String>();
        int numberOfColumns = (int) Math.ceil((this.datasetSchema.getColumnCount() - 2.0) / 3.0);
        for(int i=0; i<numberOfColumns;i++) {
            columns.add(this.datasetSchema.getColumnName(i));
        }

        return readAggregated(columns, granularity, indicators);
    }

    public TemporalColumn readAggregated(List<String> columns, int granularity){
        List<String> indicators = new ArrayList<String>();
        //add all
        indicators.add("$.MissingData");
        indicators.add("$.InvalidData");
        indicators.add("MissingTimeStamp");
        return readAggregated(columns, granularity, indicators);
    }

    public TemporalColumn readAggregated(List<String> columns, int granularity, List<String> indicators){
        logger.info("chosen indicators: "+indicators.toString());
        Iterator<Integer> iterator = aggregatedDataset.getNodeTable()
                .rows(  new ComparisonPredicate(ComparisonPredicate.EQ,
                                new ColumnExpression(ParentChildNode.DEPTH),
                                new NumericLiteral(granularity))
                );

        //name new temporal column
        TemporalColumn temporalColumn;
        if(columns.size()==1) {
            temporalColumn = new TemporalColumn(columns.get(0));
        }else if(columns.size()< (int) Math.ceil((this.datasetSchema.getColumnCount() - 2.0) / 3.0)) {
            temporalColumn = new TemporalColumn("selected");
        }else{
            temporalColumn = new TemporalColumn("all");
        }

        int id;
        double mean = 0, quality, missingTimestamp, q = 0, includeMissingValues, includeInvalidValues, includeMissingTimestamps;
        long date;

        //TODO - unsorted!*/
        while(iterator.hasNext()) {
            id = iterator.next();
            TemporalObject temporalObject = aggregatedDataset.getTemporalObject(id);
            GenericTemporalElement temporalElement = aggregatedDataset.getTemporalElement(id);
            date = temporalElement.getInf();

            // missingTimestamp = temporalObject.getDouble("MissingTimeStamp");
            quality = 0;
            mean = 0;

            //iterate over all the different columns
            for(String column : columns) {

                for(String indicator:indicators){
                    //check if its a pattern
                    indicator = indicator.replaceAll("\\$", column);
                    logger.debug(indicator);
                    q += temporalObject.getDouble(indicator);
                }

                quality += q/indicators.size();
                q = 0; //reset local aggregated quality
                mean += temporalObject.getDouble(column);
            }

            //logger.debug("before : "+quality + " timestampt: "+missingTimestamp+ "with size: "+columns.size());

            quality = (quality/columns.size());
            mean = mean/columns.size();
            TemporalValue temporalValue = new TemporalValue(date, mean, quality);
            temporalColumn.add(temporalValue);
        }

        return  temporalColumn;
    }

    public TemporalColumn readAggregated(List<String> columns, int granularity, List<String> indicators, int[] range){
        //first, get all available values
        TemporalColumn temporalColumn = readAggregated(columns, granularity, indicators);
        //retrieve size of all values and the lower and upper bound of this number

        int numberOfElements = temporalColumn.getValues().size();
        logger.info("before"+numberOfElements);
        if(range != null) {
            int lowerBound = (int) Math.round(numberOfElements * ((double) range[0] / 100));
            int upperBound = (int) Math.round(numberOfElements * ((double) range[1] / 100));

            //slice the data and only return the requested data slice instead of the full range of the data - +1 cauz toIndex is excluded by default
            temporalColumn.setValues(temporalColumn.getValues().subList(lowerBound, upperBound+1));
        }

        logger.info("after"+temporalColumn.getValues().size());

        return temporalColumn;
    }

    public String getDataPath() {
        return dataPath;
    }

    public String getDataSpecPath() {
        return dataSpecPath;
    }

    public void setDataPath(String dataPath){this.dataPath = dataPath;}

    public void setDataSpecPath(String dataSpecPath){ this.dataSpecPath = dataSpecPath;}

    public TemporalDataset getDataset() {
        return dataset;
    }

    public void setDataset(Object dataset) {
        this.dataset = (TemporalDataset) dataset;
    }

    public GranularityAggregationTree getAggregatedDataset() {
        return aggregatedDataset;
    }

    public void setAggregatedDataset(Object aggregatedDataset) {
        this.aggregatedDataset = (GranularityAggregationTree) aggregatedDataset;
    }
}