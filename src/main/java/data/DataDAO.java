package data;

import core.Schema;
import core.TemporalColumn;
import core.TemporalData;
import prefuse.data.io.DataIOException;
import timeBench.data.TemporalDataException;

import java.util.List;

public interface DataDAO{

    /**
     * Method to read the data source without params
     * @return
     */
    public Object readData() throws DataIOException, TemporalDataException;

    public TemporalData read();

    /**
     * Method to read / get a single data column from a data source
     * @param column
     * @return
     */
    public TemporalColumn read(String column);

    /**
     *
     * @param fromIndex
     * @param toIndex
     * @param column
     * @return
     */
    public TemporalColumn readTimeSlice(List<String> columns, List<String> indicators, int[] range);

    public TemporalColumn readTimeSlice(List<String> columns, List<String> indicators);

    public TemporalColumn readTimeSlice(String columns, List<String> indicators, int[] range);
    /**
     *
     * @return
     */
    public Object aggregate();

    public TemporalColumn readAggregated(String column, int granularity);

    public TemporalColumn readAggregated(String column, int granularity, List<String> indicators);

    public TemporalColumn readAggregated(String column, int granularity, List<String> indicators, int[] range);

    public TemporalColumn readAggregated(int granularity);

    public TemporalColumn readAggregated(int granularity, List<String> indicators);

    public TemporalColumn readAggregated(int granularity, List<String> indicators, int[] range);

    public TemporalColumn readAggregated(List<String> columns, int granularity, List<String> indicators, int[] range);

    public TemporalColumn readAggregated(List<String> columns, int granularity, List<String> indicators);

    public TemporalColumn readAggregated(List<String> columns, int granularity);
    /**
     *
     * @return
     */
    public Schema getColumnNames();

    public Object getDataset();

    public void setDataset(Object dataset);

    public Object getAggregatedDataset();

    public void setAggregatedDataset(Object aggregatedDataset);

    public int getDataPointsToGranularity(int granularity);
}