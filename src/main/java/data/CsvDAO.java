package data;

/**
 * Created by evolution on 16/07/2014.
 */

import core.TemporalColumn;
import core.TemporalData;
import core.TemporalValue;
import ieg.util.xml.JaxbMarshaller;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import prefuse.data.Schema;
import prefuse.data.column.Column;
import prefuse.data.io.DataIOException;
import timeBench.action.analytical.GranularityAggregationAction;
import timeBench.calendar.Calendar;
import timeBench.calendar.CalendarFactory;
import timeBench.calendar.Granularity;
import timeBench.calendar.JavaDateCalendarManager;
import timeBench.data.GranularityAggregationTree;
import timeBench.data.TemporalDataException;
import timeBench.data.TemporalDataset;
import timeBench.data.io.TextTableTemporalDatasetReader;
import timeBench.data.io.schema.TemporalDataColumnSpecification;

/**
 * Created by evolution on 07/07/2014.
 */
public class CsvDAO implements DataDAO{
    final Logger logger = LoggerFactory.getLogger(DataDAO.class);
    final String dataPath;
    final String dataSpecPath;
    private TemporalDataset tmpds;
    private core.Schema schema;

    public CsvDAO(String dataPath, String dataSpecPath) {
        this.dataPath = dataPath;
        this.dataSpecPath = dataSpecPath;
        this.tmpds = this.readData(this.dataPath, this.dataSpecPath);
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
        Schema schema = tmpds.getDataColumnSchema();
        for(int i=0; i<schema.getColumnCount(); i++){
            temporalData.add(this.read(schema.getColumnName(i)));
        }

        return temporalData;
    }

    public TemporalColumn read(String column){
        return this.readTimeSlice(0, tmpds.getTemporalObjectTable().getRowCount()-1, column);
    }

    public TemporalData readTimeSlice(int fromIndex, int toIndex){
        TemporalData temporalData = new TemporalData();
        Schema schema = tmpds.getDataColumnSchema();
        for(int i=0; i<schema.getColumnCount(); i++){
            temporalData.add(readTimeSlice(fromIndex, toIndex, schema.getColumnName(i)));
        }

        return temporalData;
    }

    public TemporalColumn readTimeSlice(int fromIndex, int toIndex, String column){
        TemporalColumn temporalColumn = new TemporalColumn();
        temporalColumn.setName(column);

        if(column != null && !column.equals("")){
            //first get the column and convert it to an array list
            Column dataColumn = tmpds.getTemporalObjectTable().getColumn(column);
            Column missingDataColumn = tmpds.getTemporalObjectTable().getColumn(column+".MissingData");
            Column invalidDataColumn = tmpds.getTemporalObjectTable().getColumn(column+".InvalidData");

            for(int i=0; i<dataColumn.getRowCount(); i++){
                double dataValue = (double) dataColumn.get(i);
                int qualityValue = (missingDataColumn.get(i).toString().equals("1") || invalidDataColumn.get(i).toString().equals("1")) ? 1 : 0;

                long inf = tmpds.getTemporalElements().getTemporalElementByRow(i).getInf();
                long sup = tmpds.getTemporalElements().getTemporalElementByRow(i).getSup();
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
        GranularityAggregationAction timeAggregationAction = new GranularityAggregationAction(tmpds,
                new Granularity[] {
                        CalendarFactory.getSingleton().getGranularity(calendar,"Top","Top"),
                        CalendarFactory.getSingleton().getGranularity(calendar,"Year","Top"),
                        CalendarFactory.getSingleton().getGranularity(calendar,"Week","Year"),
                        CalendarFactory.getSingleton().getGranularity(calendar,"Day","Week") },
                -1.0);
        timeAggregationAction.run(0);
        return timeAggregationAction.getGranularityAggregationTree();
    }

    public core.Schema getColumnNames(){
        if(schema == null) {
            core.Schema schema = new core.Schema();
            prefuse.data.Schema prefuseSchema = tmpds.getTemporalObjectTable().getSchema();
            //cut off the first 3 columns as they are id... temp something..
            for (int i = 3; i < prefuseSchema.getColumnCount(); i++) {
                schema.addColumn(new core.Column(prefuseSchema.getColumnName(i)));
            }
            logger.info("available columns {}", schema.getColumns().toString());
        }

        return schema;
    }

    public TemporalDataset getDataset(){
        return this.tmpds;
    }
}