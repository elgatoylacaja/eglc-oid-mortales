import { Graph } from './components/Graph';
import { useGraphData } from './hooks/useGraphData';

export function App() {
  const { nodes, edges, loading, error } = useGraphData();

  if (loading) {
    return (
      <div className="w-screen h-screen bg-zinc-950 flex items-center justify-center">
        <span className="text-zinc-400 text-sm">Loading graph...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen h-screen bg-zinc-950 flex items-center justify-center">
        <span className="text-red-400 text-sm">Error: {error}</span>
      </div>
    );
  }

  return <div className='w-full h-full flex flex-wrap'>
    <Graph className='w-[50dvw] h-[50dvh]' id="none" nodes={nodes} edges={edges} sizeMetric={'none'} />
    <Graph className='w-[50dvw] h-[50dvh]' id="followers" nodes={nodes} edges={edges} sizeMetric={'followers'} />
    <Graph className='w-[50dvw] h-[50dvh]' id="total_collabs" nodes={nodes} edges={edges} sizeMetric={'total_collabs'} />
    <Graph className='w-[50dvw] h-[50dvh]' id="betweenness" nodes={nodes} edges={edges} sizeMetric={'betweenness'} />
  </div>
}
