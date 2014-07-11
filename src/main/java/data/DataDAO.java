package data;

import ieg.util.xml.JaxbMarshaller;
import prefuse.data.io.DataIOException;
import timeBench.action.analytical.GranularityAggregationAction;
import timeBench.calendar.Calendar;
import timeBench.calendar.CalendarFactory;
import timeBench.calendar.Granularity;
import timeBench.calendar.JavaDateCalendarManager;
import timeBench.data.TemporalDataException;
import timeBench.data.TemporalDataset;
import timeBench.data.io.TextTableTemporalDatasetReader;
import timeBench.data.io.schema.TemporalDataColumnSpecification;

import javax.xml.bind.JAXBException;
import java.io.IOException;

/**
 * Created by evolution on 07/07/2014.
 */
public class DataDAO {
    final String dataPath;
    final String dataSpecPath;


    public DataDAO(String dataPath, String dataSpecPath) throws DataIOException, TemporalDataException, JAXBException, IOException {
        this.dataPath = dataPath;
        this.dataSpecPath = dataSpecPath;
    }

    public TemporalDataset read() throws IOException, JAXBException, DataIOException, TemporalDataException {
        TemporalDataColumnSpecification spec = (TemporalDataColumnSpecification) JaxbMarshaller
                .load(dataSpecPath, TemporalDataColumnSpecification.class);
        TextTableTemporalDatasetReader reader = new TextTableTemporalDatasetReader(spec);
        TemporalDataset tmpds = reader.readData(dataPath);
        return tmpds;


        Calendar calendar = JavaDateCalendarManager.getSingleton().getDefaultCalendar();
        GranularityAggregationAction timeAggregationAction = new GranularityAggregationAction(tmpds,
                new Granularity[] {
                        CalendarFactory.getSingleton().getGranularity(calendar,"Top","Top"),
                        CalendarFactory.getSingleton().getGranularity(calendar,"Day","Top"),
                        CalendarFactory.getSingleton().getGranularity(calendar,"Hour","Day"),
                        CalendarFactory.getSingleton().getGranularity(calendar,"Minute","Hour") },
                -1.0);
        timeAggregationAction.run(0);
        timeAggregationAction.getGranularityAggregationTree();




        Predicate[] templates = new Predicate[4];
		templates[0] =  new AndPredicate(
        new ComparisonPredicate(ComparisonPredicate.GTEQ, new ColumnExpression("value"), new NumericLiteral(0)),
			new ComparisonPredicate(ComparisonPredicate.LTEQ, new ColumnExpression("value"), new NumericLiteral(105)));
		templates[1] =  new AndPredicate(
				new ComparisonPredicate(ComparisonPredicate.GTEQ, new ColumnExpression("value"), new NumericLiteral(106)),
				new ComparisonPredicate(ComparisonPredicate.LTEQ, new ColumnExpression("value"), new NumericLiteral(277)));
		templates[2] =  new AndPredicate(
				new ComparisonPredicate(ComparisonPredicate.GTEQ, new ColumnExpression("value"), new NumericLiteral(278)),
				new ComparisonPredicate(ComparisonPredicate.LTEQ, new ColumnExpression("value"), new NumericLiteral(364)));
		templates[3] =  new AndPredicate(
				new ComparisonPredicate(ComparisonPredicate.GTEQ, new ColumnExpression("value"), new NumericLiteral(365)),
				new ComparisonPredicate(ComparisonPredicate.LTEQ, new ColumnExpression("value"), new NumericLiteral(662)));

        IntervalEventFindingAction action = new IntervalEventFindingAction(sourceDataset, templates,IntervalEventFindingAction.SPACING_ALLOWED);
		action.setDoMutiny(false);
		action.run(0.0);

		TemporalDataset events = action.getTemporalDataset();
		DebugHelper.printTemporalDatasetTable(System.out, events,"label","class",TemporalObject.ID);
		System.out.println(events.getNodeCount());

         */



    }


}
