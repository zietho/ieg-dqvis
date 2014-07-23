package resources;

import com.sun.jersey.api.client.WebResource;
import data.CsvDAO;
import io.dropwizard.logging.LoggingFactory;
import io.dropwizard.testing.junit.ResourceTestRule;
import org.junit.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import timeBench.data.TemporalDataset;

import static org.junit.Assert.*;

/**
 * Created by evolution on 13/07/2014.
 */
public class AvailableColumnsResourceTest {

    public static TemporalDataset tmpds = null;

    @Rule
    public ResourceTestRule resources = ResourceTestRule.builder().addResource(new AvailableColumnsResource(CsvDAO.getInstance("src/test/resources/data/test.csv", "src/test/resources/data/test.xml")))
            .build();

    @BeforeClass
    public static void setup() {

    }

    @Test
    public void testGetAvailableColumnsShouldReturnAllColumnsFromSchema(){
        WebResource webResource = resources.client().resource("/get-available-columns");
        String responseMessage = webResource.get(String.class);
        //logger.debug(responseMessage);
        assertTrue(responseMessage.contains("h"));
    }



}
