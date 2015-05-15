package data;

import core.Schema;
import core.TemporalColumn;
import core.TemporalData;
import org.junit.Before;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import timeBench.data.GranularityAggregationTree;
import timeBench.data.TemporalDataset;

import java.util.ArrayList;
import java.util.List;

import static org.junit.Assert.assertTrue;

public abstract class DataDAOTest {
    Logger logger = LoggerFactory.getLogger(DataDAOTest.class);
    public static DataDAO dataDAO;
    private String data;
    private String spec;

    protected void setUpDAO(DataDAO dataDAO){
        DataDAOTest.dataDAO = dataDAO;
    }


    @Before
    public void initialize() {
        //initialize stuffx

    }

    @Test
    public void testReadDataShouldReturnTemporalDataset() throws Exception {
        TemporalDataset temporalDataset = (TemporalDataset) dataDAO.getDataset();
        assertTrue(temporalDataset != null);
        int rowCount = temporalDataset.getTemporalObjectTable().getRowCount();
        logger.info("row count is " + rowCount);
        assertTrue(rowCount > 1);
    }

    @Test
    public void testReadShouldReturnTermporalData() throws Exception{
        TemporalData temporalData = dataDAO.read();
        assertTrue(temporalData.getColumns().size() == 28); //garuantee that the dataset contains 28 columns
        assertTrue(temporalData.getColumns().get(0).getValues().size()>1); // guarentee that the dataset contains 13 rows / records
    }

    @Test
    public void testAggregateShouldReturnAggregationTree() throws Exception {
        GranularityAggregationTree tree = (GranularityAggregationTree) dataDAO.aggregate();
        assertTrue(tree!=null);
    }

    @Test
    public void testAggregateAndRetrieveData() throws Exception {
//        dataDAO.setAggregatedDataset((GranularityAggregationTree) dataDAO.aggregate());
//        logger.info("LEVEL 0");
//        TemporalColumn temporalColumn1 = dataDAO.readAggregated("h", 0);
//        logger.info("LEVEL 1");
//        TemporalColumn temporalColumn2 = dataDAO.readAggregated("h", 1);
//        logger.info("LEVEL 2");
//        TemporalColumn temporalColumn3 = dataDAO.readAggregated("h", 2);
//        logger.info("LEVEL 3");
//        TemporalColumn temporalColumn4 = dataDAO.readAggregated("h", 3);
//        assertTrue(temporalColumn1.getValues().size()>0);
    }

    @Test
    public void testDouble() throws Exception{
        int a = 0;
        int b = 1;
        double c = (a+b)/2;
        logger.info("c: "+c);
        logger.info("ohne: "+(double)(0+1)/2);
        logger.info("mit: "+(0.0+1.0)/2);
        String astr = "1.0";
        String bstr= "0.0";
        double aa = Double.parseDouble(astr);
        double bb = Double.parseDouble(bstr);
        logger.info(Double.valueOf(astr)+ " + " + Double.valueOf(bstr) + " = " + ((Double.valueOf(astr)+Double.valueOf(bstr))/2));
        logger.info("parsed: " + a + "+" + b+"="+ ((a+b)/2));


    }


    @Test
    public void testMinutes() throws Exception{
        dataDAO.setAggregatedDataset((GranularityAggregationTree) dataDAO.aggregate());
        TemporalColumn temporalColumn = dataDAO.readAggregated("h", 3);
        logger.info("size: "+temporalColumn.getValues().size());
        assertTrue(temporalColumn.getValues().size() == 4);
        double h = temporalColumn.getValues().get(0).getColumn();
        double h2 =  temporalColumn.getValues().get(1).getColumn();
        double h3  =  temporalColumn.getValues().get(2).getColumn();
        logger.info(""+h);
        logger.info(""+h2);
        logger.info(""+h3);
        assertTrue(h == 1.5);
        assertTrue(h2 == 6);
        assertTrue(h3 == 2.5);

    }

    @Test
    public void testHours() throws Exception{
        dataDAO.setAggregatedDataset((GranularityAggregationTree) dataDAO.aggregate());
        TemporalColumn temporalColumn = dataDAO.readAggregated("h", 2);
        logger.info("size: " + temporalColumn.getValues().size());
        assertTrue(temporalColumn.getValues().size()==3);

    }

    @Test
    public void testDays() throws Exception{
        dataDAO.setAggregatedDataset((GranularityAggregationTree) dataDAO.aggregate());
        TemporalColumn temporalColumn = dataDAO.readAggregated("h", 1);
        logger.info("size: "+temporalColumn.getValues().size());
        assertTrue(temporalColumn.getValues().size()==2);

    }

    @Test
    public void testTop() throws Exception{
        dataDAO.setAggregatedDataset((GranularityAggregationTree) dataDAO.aggregate());
        TemporalColumn temporalColumn = dataDAO.readAggregated("h", 0);
        logger.info("size: "+temporalColumn.getValues().size());
        assertTrue(temporalColumn.getValues().size()==1);
    }

    @Test
    public void testGetAvailableColumns() throws Exception{
        Schema schema = dataDAO.getColumnNames();
        assertTrue(schema.getColumns().size()==9);

    }

    @Test
    public void readAggregatedDataSliceTest() throws Exception{
        List<String> indicators = new ArrayList<String>();
        //add all
        indicators.add("$.MissingData");
        indicators.add("$.InvalidData");
        indicators.add("MissingTimeStamp");

        dataDAO.setAggregatedDataset((GranularityAggregationTree) dataDAO.aggregate());
        List<String> columns = new ArrayList<String>();
        columns.add("h");
        TemporalColumn temporalColumn = dataDAO.readAggregated(columns, 2, indicators, new int[]{33,66});
        logger.info("data slice");
        logger.info("size: "+temporalColumn.getValues().size());
        assertTrue(temporalColumn.getValues().size()==2);
    }

    @Test
    public void testReadAggregatedWithColumnGranularityAndIndicators() throws Exception{

        //agregated
        dataDAO.setAggregatedDataset((GranularityAggregationTree) dataDAO.aggregate());

        //first generate all indicators
        List<String> indicators = new ArrayList<String>();
        indicators.add("$.InvalidData");

        //read out results
        TemporalColumn temporalColumn = dataDAO.readAggregated("w", 3, indicators);
        logger.info(""+temporalColumn.getValues().get(0).getQuality());
        logger.info(""+temporalColumn.getValues().get(1).getQuality());
        assertTrue(temporalColumn.getValues().get(0).getQuality()==0.5);
        assertTrue(temporalColumn.getValues().get(1).getQuality()==0.3333333333333333);
        assertTrue(temporalColumn.getValues().get(2).getQuality()==1);
        assertTrue(temporalColumn.getValues().get(3).getQuality()==1);
    }




}