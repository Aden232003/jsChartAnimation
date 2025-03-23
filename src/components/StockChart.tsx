import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface StockData {
  Date: string;
  Close: number;
}

interface StockChartProps {
  data: StockData[];
}

const StockChart = ({ data }: StockChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [key, setKey] = useState(0); // For forcing re-render

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const reloadAnimation = () => {
    setKey(prev => prev + 1);
  };

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Set dimensions based on expanded state
    const margin = { top: 20, right: 30, bottom: 30, left: 60 };
    const width = (isExpanded ? window.innerWidth - 100 : 800) - margin.left - margin.right;
    const height = (isExpanded ? window.innerHeight - 100 : 400) - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Parse dates and create scales
    const parseDate = d3.timeParse('%Y-%m-%d');
    const dates = data.map(d => parseDate(d.Date)!);
    const prices = data.map(d => d.Close);

    const x = d3.scaleTime()
      .domain(d3.extent(dates) as [Date, Date])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([d3.min(prices) * 0.95, d3.max(prices) * 1.05] as [number, number])
      .range([height, 0]);

    // Create line generator
    const line = d3.line<StockData>()
      .x(d => x(parseDate(d.Date)!))
      .y(d => y(d.Close));

    // Add white background
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'white');

    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .style('color', '#333');

    // Add Y axis
    svg.append('g')
      .call(d3.axisLeft(y))
      .style('color', '#333');

    // Add the line path with animation
    const path = svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#000')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Get total length of the path
    const pathNode = path.node();
    const totalLength = pathNode ? pathNode.getTotalLength() : 0;

    // Set up the animation with smoother easing and longer duration
    path.attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(3500) // Increased duration
      .ease(d3.easeCubicInOut) // Smoother easing function
      .attr('stroke-dashoffset', 0);

    // Add hover effects
    const focus = svg.append('g')
      .style('display', 'none');

    // Add circle to follow the line
    focus.append('circle')
      .attr('r', 5)
      .attr('fill', '#000');

    // Add tooltip
    focus.append('rect')
      .attr('class', 'tooltip')
      .attr('width', 120)
      .attr('height', 50)
      .attr('fill', 'rgba(255, 255, 255, 0.9)')
      .attr('stroke', '#000')
      .attr('rx', 4)
      .attr('ry', 4);

    focus.append('text')
      .attr('class', 'tooltip-date')
      .attr('x', 10)
      .attr('y', 20)
      .style('fill', '#000');

    focus.append('text')
      .attr('class', 'tooltip-price')
      .attr('x', 10)
      .attr('y', 40)
      .style('fill', '#000');

    // Add overlay for mouse tracking
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .on('mouseover', () => focus.style('display', null))
      .on('mouseout', () => focus.style('display', 'none'))
      .on('mousemove', (event) => {
        const bisect = d3.bisector((d: StockData) => parseDate(d.Date)!).left;
        const x0 = x.invert(d3.pointer(event)[0]);
        const i = bisect(data, x0, 1);
        const d0 = data[i - 1];
        const d1 = data[i];
        const d = x0.getTime() - parseDate(d0.Date)!.getTime() > parseDate(d1.Date)!.getTime() - x0.getTime() ? d1 : d0;

        focus.attr('transform', `translate(${x(parseDate(d.Date)!)},${y(d.Close)})`);
        focus.select('.tooltip')
          .attr('transform', `translate(${10},${-60})`);
        focus.select('.tooltip-date')
          .text(`Date: ${d.Date}`);
        focus.select('.tooltip-price')
          .text(`Price: $${d.Close.toFixed(2)}`);
      });

  }, [data, isExpanded, key]);

  return (
    <div className={`chart-container ${isExpanded ? 'expanded' : ''}`}>
      <div className="chart-controls">
        <button onClick={toggleExpand} className="control-button">
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
        <button onClick={reloadAnimation} className="control-button">
          Reload Animation
        </button>
      </div>
      <svg ref={svgRef} key={key}></svg>
    </div>
  );
};

export default StockChart; 