package resources;

import data.CsvDAO;
import io.dropwizard.testing.junit.ResourceTestRule;
import org.junit.BeforeClass;
import org.junit.Rule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class TimesliderIndexResourceTest {
    final Logger logger = LoggerFactory.getLogger(TimesliderIndexResourceTest.class);

    @Rule
    public ResourceTestRule resources = ResourceTestRule.builder().addResource(new TimesliderIndexResource(CsvDAO.getInstance("src/test/resources/data/test.csv", "src/test/resources/data/test.xml")))
            .build();

    @BeforeClass
    public static void setup() {

    }
/*
    @Test
    public void testGetTimesliderIndices(){
        WebResource webResource = resources.client().resource("/get-timeslider-indices");
        String responseMessage = webResource.get(String.class);
        logger.trace(responseMessage);
        assertTrue(true);
    }
    */
}