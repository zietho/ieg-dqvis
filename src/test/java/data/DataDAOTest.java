package data;

import core.TemporalData;
import ieg.prefuse.data.ParentChildNode;
import org.junit.Test;
import prefuse.data.Graph;
import prefuse.data.Node;
import prefuse.data.Table;
import prefuse.data.Tuple;
import prefuse.data.expression.ColumnExpression;
import prefuse.data.expression.ComparisonPredicate;
import prefuse.data.expression.NumericLiteral;
import prefuse.data.expression.Predicate;
import prefuse.data.tuple.TupleSet;
import timeBench.data.*;

import java.util.Date;
import java.util.Iterator;
import java.util.List;

import static org.junit.Assert.*;

public class DataDAOTest {
    public DataDAO dataDAO;

    @Test
    public void testReadDataShouldReturnTemporalDataset() throws Exception {
        //set paths for data
        final String data = "src/test/resources/data/test.csv";
        final String spec = "src/test/resources/data/test.xml";
        dataDAO = CsvDAO.getInstance(data, spec);
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