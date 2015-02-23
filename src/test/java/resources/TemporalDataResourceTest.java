package resources;

import core.TemporalData;
import data.CsvDAO;
import io.dropwizard.testing.junit.ResourceTestRule;
import org.junit.ClassRule;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static org.junit.Assert.*;

/**
 * Created by evolution on 19/02/2015.
 */
public class TemporalDataResourceTest {
    final Logger logger = LoggerFactory.getLogger(TemporalDataResource.class);

    private static String data = "src/test/resources/data/test.csv";
    private static String spec = "src/test/resources/data/test.xml";

    @ClassRule
    public static final ResourceTestRule resources = ResourceTestRule.builder()
            .addResource(new TemporalDataResource(CsvDAO.getInstance(data, spec)))
            .build();

    @Test
    public void testReadData() {
        logger.info("hello world");
        TemporalData temporalData = resources.client().resource("/get-data?column=h&granularity=3").get(TemporalData.class);
        assertTrue(!temporalData.getColumns().isEmpty());
    }
}
