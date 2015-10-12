package resources;

import app.Application;
import app.ApplicationConfiguration;
import core.TemporalColumn;
import core.TemporalData;
import core.TemporalValue;
import data.CsvDAO;
import data.DataDAO;
import io.dropwizard.testing.junit.DropwizardAppRule;
import io.dropwizard.testing.junit.ResourceTestRule;
import org.junit.ClassRule;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Created by evolution on 19/02/2015.
 */
public class TemporalDataResourceTest {
    private static final Logger logger = LoggerFactory.getLogger(TemporalDataResourceTest.class);
    private static String data = "src/test/resources/data/01_raw_data_set1_preprocessed.csv";
    private static String spec = "src/test/resources/data/test.xml";

    @ClassRule
    public static final DropwizardAppRule<ApplicationConfiguration> RULE =
            new DropwizardAppRule<ApplicationConfiguration>(Application.class, "configuration.yml");

    @ClassRule
    public static final ResourceTestRule resources = ResourceTestRule.builder()
            .addResource(new TemporalDataResource(CsvDAO.getInstance(data, spec)))
            .build();


    //test calculations

    @Test
    public void testReadColumnWithGranularityMinutes() {
        TemporalData temporalData = resources.client().resource("/get-data?column=h&granularity=minute").get(TemporalData.class);
        assertTrue(!temporalData.getColumns().isEmpty());
        assertTrue(temporalData.getColumns().get(0).getValues().size()==4);

        //test individual aggregations on the minutes level
        assertTrue(temporalData.getColumns().get(0).getValues().get(0).getColumn()==1.5);
        assertTrue(temporalData.getColumns().get(0).getValues().get(1).getColumn()==6.0);
        assertTrue(temporalData.getColumns().get(0).getValues().get(2).getColumn()==2.5);
        assertTrue(temporalData.getColumns().get(0).getValues().get(3).getColumn()==1.0);

    }

    @Test
    public void testReadColumnWithGranularityHours() {
        TemporalData temporalData = resources.client().resource("/get-data?column=h&granularity=hour").get(TemporalData.class);
        assertTrue(!temporalData.getColumns().isEmpty());
        assertTrue(temporalData.getColumns().get(0).getValues().size()==3);
        assertTrue(temporalData.getColumns().get(0).getValues().get(0).getColumn() == 3.75);
        assertTrue(temporalData.getColumns().get(0).getValues().get(1).getColumn() == 2.5);
        assertTrue(temporalData.getColumns().get(0).getValues().get(2).getColumn() == 1);
    }

    @Test
    public void testReadColumnWithGranularityDays() {
        TemporalData temporalData = resources.client().resource("/get-data?column=h&granularity=day").get(TemporalData.class);
        assertTrue(!temporalData.getColumns().isEmpty());
        assertTrue(temporalData.getColumns().get(0).getValues().size()==2);
        assertTrue(temporalData.getColumns().get(0).getValues().get(0).getColumn() == 3.75);
        assertTrue(temporalData.getColumns().get(0).getValues().get(1).getColumn() == 1.75);
    }

    @Test
    public void testReadColumnWithGranularityTop() {
        TemporalData temporalData = resources.client().resource("/get-data?column=h&granularity=top").get(TemporalData.class);
        assertTrue(!temporalData.getColumns().isEmpty());
        assertTrue(temporalData.getColumns().get(0).getValues().size()==1);
        assertTrue(temporalData.getColumns().get(0).getValues().get(0).getColumn() == 2.75);
    }

    @Test
    public void testSingleQualityHWithTop(){
        TemporalData temporalData = resources.client().resource("/get-data?column=h&granularity=top").get(TemporalData.class);
        assertTrue(temporalData.getColumns().get(0).getValues().get(0).getQuality()==0.13888888888888887);
    }

    @Test
    public void testSingleQualityOfHWithMinutes(){
        TemporalData temporalData = resources.client().resource("/get-data?column=w&granularity=minutes").get(TemporalData.class);
        List<TemporalValue> values = temporalData.getColumns().get(0).getValues();
        assertTrue(values.get(0).getQuality() == 0.16666666666666666);
        assertTrue(values.get(1).getQuality() == 0.3333333333333333);
        assertTrue(values.get(2).getQuality() == 0.3333333333333333);
        assertTrue(values.get(3).getQuality() == 0.6666666666666666);

    }

    @Test
    public void testSingleQualityOfWWithGranularityTop(){
        TemporalData temporalData = resources.client().resource("/get-data?column=w&granularity=top").get(TemporalData.class);
        assertTrue(temporalData.getColumns().get(0).getValues().get(0).getQuality() == 0.375);
    }

    @Test
    public void testReadAllWithGranularity() {
        TemporalData temporalData = resources.client().resource("/get-data?granularity=minute").get(TemporalData.class);
        assertTrue(!temporalData.getColumns().isEmpty());
        assertTrue(temporalData.getColumns().get(0).getValues().size()==4);
        double qualityOfLast = temporalData.getColumns().get(0).getValues().get(3).getQuality();
        logger.debug("quality of last: "+qualityOfLast);
        assertTrue(qualityOfLast>0.37);
    }

    //@TODO: test with calculated values!
    @Test
    public void testReadSelectedWithGranularity() {
        TemporalData temporalData = resources.client().resource("/get-data?column=w&column=h&column=p1&column=m2&granularity=minute").get(TemporalData.class);
        assertTrue(!temporalData.getColumns().isEmpty());
    }

    //test whether elements are filled with values
    @Test
    public void testWhetherAllValuesAreSetWithSingleColumns(){
        TemporalData temporalData = resources.client().resource("/get-data?column=w&granularity=minute").get(TemporalData.class);
        for(TemporalColumn temporalColumn : temporalData.getColumns()) {
            assertNotNull(temporalColumn.getValues().get(0).getColumn());

        }
    }

    //test granularietis
    @Test
    public void testGetSuitableGranularity() {
        DataDAO dataDAO = mock(CsvDAO.class);
        when(dataDAO.getDataPointsToGranularity(0)).thenReturn(100);
        when(dataDAO.getDataPointsToGranularity(1)).thenReturn(2400);
        when(dataDAO.getDataPointsToGranularity(2)).thenReturn(12000);
        when(dataDAO.getDataPointsToGranularity(3)).thenReturn(280000);
        TemporalDataResource temporalDataResource = new TemporalDataResource(dataDAO);
        int[] range = {20,50}; // > 30%, which means the total number of data points should be multiplied by this number.
        int granularity = temporalDataResource.getSuitableGranularity(range);
        assertTrue(granularity == 2);

        when(dataDAO.getDataPointsToGranularity(0)).thenReturn(8400);
        when(dataDAO.getDataPointsToGranularity(1)).thenReturn(10200);
        when(dataDAO.getDataPointsToGranularity(2)).thenReturn(12000);
        range[0]=0;
        range[1]=100;
        granularity = temporalDataResource.getSuitableGranularity(range);
        assertTrue(granularity == 0);

        when(dataDAO.getDataPointsToGranularity(0)).thenReturn(19000);
        when(dataDAO.getDataPointsToGranularity(1)).thenReturn(400000);
        range[0]=0;
        range[1]=50;
        granularity = temporalDataResource.getSuitableGranularity(range);
        assertTrue(granularity == 0);
    }


}
