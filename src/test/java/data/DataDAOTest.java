package data;

import org.junit.Test;
import prefuse.data.Graph;
import prefuse.data.Node;
import prefuse.data.Table;
import prefuse.data.tuple.TupleSet;
import timeBench.data.*;

import java.util.List;

import static org.junit.Assert.*;

public class DataDAOTest {

    @Test
    public void testRead() throws Exception {
        //set paths for data
        final String data = "src/test/resources/data/test.csv";
        final String spec = "src/test/resources/data/test.xml";
        DataDAO dataDAO = new CsvDAO(data, spec);
        TemporalDataset temporalDataset = (TemporalDataset) dataDAO.getDataset();
        assertTrue(temporalDataset != null);
        assertTrue(temporalDataset.getTemporalObjectTable().getRowCount() > 0);
    }

    @Test
    public void testAggregate() throws Exception {
       assertTrue(false);
       /* final String data = "src/test/resources/data/test.csv";
        final String spec = "src/test/resources/data/test.xml";
        DataDAO dataDAO = new DataDAO(data, spec);
        TemporalDataset temporalDataset = dataDAO.read();

        GranularityAggregationTree tree = dataDAO.aggregate(temporalDataset);
        System.out.println(tree.getChildRow(0,0));
        TemporalElementStore tes = tree.getTemporalElements();
        TupleSet ts = tes.getEdges();

        System.out.println(tree.getMaxDepth());
        System.out.println(tree.getChildCount(0));

        for(int i=0; i<2; i++){
            for(int j=0; j<tree.getChildCount(i); j++){
                Node node = tree.getNode(tree.getChildRow(i,j));
                System.out.println(node.getString("h"));
                System.out.println(node.toString());
                node.getChildCount();
            }
        }*/
    }




}