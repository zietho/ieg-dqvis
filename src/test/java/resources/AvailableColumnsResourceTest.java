package resources;

import com.sun.jersey.api.client.WebResource;
import data.DataDAO;
import io.dropwizard.testing.junit.ResourceTestRule;
import org.junit.*;
import timeBench.data.TemporalDataset;

import static org.junit.Assert.*;

/**
 * Created by evolution on 13/07/2014.
 */
public class AvailableColumnsResourceTest {

    public static TemporalDataset tmpds = null;

    @Rule
    public ResourceTestRule resources = ResourceTestRule.builder()
            .addResource(new AvailableColumnsResource(tmpds))
            .build();

    @BeforeClass
    public static void setup() {
        //set paths for data
        final String data = "src/test/resources/data/test.csv";
        final String spec = "src/test/resources/data/test.xml";
        DataDAO dataDAO = new DataDAO(data, spec);
        tmpds = dataDAO.read();
    }

    @Test
    public void testGetAvailableColumnsShouldReturnAllColumnsFromSchema(){
        WebResource webResource = resources.client().resource("/get-available-columns");
        String responseMessage = webResource.get(String.class);
        assertTrue(responseMessage.contains("h"));
    }



}
