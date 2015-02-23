package data;

import org.junit.Before;

/**
 * Created by evolution on 13/01/2015.
 */
public class CsvDAOTest extends DataDAOTest {

    @Before
    public void initialize(){
        String data = "src/test/resources/data/test.csv";
        String spec = "src/test/resources/data/test.xml";
        CsvDAO csvDAO = CsvDAO.getInstance(data, spec);
        this.setUpDAO(csvDAO);
    }
}
