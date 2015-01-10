package data;

import core.TemporalData;
import org.junit.Before;
import org.junit.Test;
import timeBench.data.GranularityAggregationTree;
import timeBench.data.TemporalDataset;

import static org.junit.Assert.assertTrue;

public class DataDAOTest {
    public DataDAO dataDAO;
    private String data;
    private String spec;

    @Before
    public void initialize() {
        //set paths for data
        data = "src/test/resources/data/test.csv";
        spec = "src/test/resources/data/test.xml";
        dataDAO = CsvDAO.getInstance(data, spec);
    }

    @Test
    public void testReadDataShouldReturnTemporalDataset() throws Exception {
        TemporalDataset temporalDataset = (TemporalDataset) dataDAO.getDataset();
        assertTrue(temporalDataset != null);
        assertTrue(temporalDataset.getTemporalObjectTable().getRowCount() > 0);
    }

    @Test
    public void testReadShouldReturnTermporalData() throws Exception{
        TemporalData temporalData = dataDAO.read();
        assertTrue(temporalData.getColumns().size()==28); //garuantee that the dataset contains 28 columns
        assertTrue(temporalData.getColumns().get(0).getValues().size()==13); // guarentee that the dataset contains 13 rows / records
    }

    @Test
    public void testAggregateShouldReturnAggregationTree() throws Exception {
        GranularityAggregationTree tree = (GranularityAggregationTree) dataDAO.getAggregatedDataset();
        assertTrue(tree!=null);
    }

    @Test
    public void testGetAggregatedData() throws Exception {
        GranularityAggregationTree tree = (GranularityAggregationTree) dataDAO.getAggregatedDataset();

        assertTrue(tree instanceof GranularityAggregationTree);
        assertTrue(tree!=null);
    }




}