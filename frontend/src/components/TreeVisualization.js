import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './TreeVisualization.css';

const TreeVisualization = ({ treeData, correctSubtopics, incorrectSubtopics }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!treeData || !svgRef.current) return;

    const margin = { top: 100, right: 100, bottom: 100, left: 100 };
    const width = 1200 - margin.left - margin.right;
    const height = 800 - margin.top - margin.bottom;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', width + margin.right + margin.left)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const treemap = d3.tree().size([height, width]);
    const root = d3.hierarchy(treeData);
    const treeLinks = treemap(root);

    const nodes = treeLinks.descendants();
    const links = treeLinks.links();

    // Draw links
    svg
      .selectAll('.link')
      .data(links)
      .enter()
      .insert('path', 'g')
      .attr('class', 'link')
      .attr(
        'd',
        d3
          .linkVertical()
          .x((d) => d.x)
          .y((d) => d.y)
      );

    // Draw nodes
    const node = svg
      .selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d) => `translate(${d.x},${d.y})`);

    const getNodeColor = (name) => {
      if (correctSubtopics.includes(name)) {
        return 'rgba(0,255,0,0.8)';
      }
      if (incorrectSubtopics.includes(name)) {
        return 'rgba(255,0,0,0.8)';
      }
      return 'rgba(50,50,50,0.8)';
    };

    node
      .append('circle')
      .attr('r', 15)
      .style('fill', (d) => getNodeColor(d.data.name));

    node
      .append('text')
      .attr('dy', '0.31em')
      .attr('x', -40)
      .attr('text-anchor', 'end')
      .style('font-size', '12px')
      .style('fill', '#000')
      .text((d) => d.data.name)
      .call(wrap, 80);

  }, [treeData, correctSubtopics, incorrectSubtopics]);

  const wrap = (text, width) => {
    text.each(function () {
      const text = d3.select(this);
      const words = text.text().split(/\s+/).reverse();
      let word;
      let line = [];
      const lineHeight = 1.1;
      const y = text.attr('y');
      const dy = parseFloat(text.attr('dy'));
      let tspan = text
        .text(null)
        .append('tspan')
        .attr('x', -40)
        .attr('y', y)
        .attr('dy', dy + 'em');

      while ((word = words.pop())) {
        line.push(word);
        tspan.text(line.join(' '));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(' '));
          line = [word];
          tspan = text
            .append('tspan')
            .attr('x', -40)
            .attr('y', y)
            .attr('dy', lineHeight + 'em')
            .text(word);
        }
      }
    });
  };

  return (
    <div className="tree-visualization">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default TreeVisualization;
