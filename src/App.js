import React, { useState } from 'react';

const App = () => {
  const [algorithm, setAlgorithm] = useState("");
  const [array, setArray] = useState([]);
  const [arraySize, setArraySize] = useState(0);
  const [tempArray, setTempArray] = useState([]);
  const [comparing, setComparing] = useState([-1, -1]);
  const [swapping, setSwapping] = useState([-1, -1]);
  const [minimum, setMinimum] = useState(-1);
  const [current, setCurrent] = useState(-1);
  const [sortedIndices, setSortedIndices] = useState([]);
  const [treeNodes, setTreeNodes] = useState([]);
  const [isSorting, setIsSorting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSorted, setIsSorted] = useState(false);
  const [message, setMessage] = useState("");
  const [pivotIndex, setPivotIndex] = useState(-1);
  const [mergingIndices, setMergingIndices] = useState([]);

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleArraySizeChange = (e) => {
    const size = parseInt(e.target.value);
    if (!isNaN(size) && size > 0) {
      setArraySize(size);
      setTempArray(new Array(size).fill(""));
    }
  };

  const handleElementChange = (index, value) => {
    const updatedArray = [...tempArray];
    updatedArray[index] = value;
    setTempArray(updatedArray);
  };

  const submitArray = () => {
    const parsedArray = tempArray.map(Number);
    if (parsedArray.some(isNaN)) {
      alert("Please enter valid numbers!");
      return;
    }
    setArray(parsedArray);
    setIsInitialized(true);
  };

  const bubbleSort = async () => {
    const arr = [...array];
    const n = arr.length;
    
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        setComparing([j, j + 1]);
        await sleep(500);
        
        if (arr[j] > arr[j + 1]) {
          setSwapping([j, j + 1]);
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          setArray([...arr]);
          await sleep(500);
        }
      }
      setSortedIndices(prev => [...prev, n - 1 - i]);
    }
    finishSorting(arr.length);
  };

  const selectionSort = async () => {
    const arr = [...array];
    const n = arr.length;
    
    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      setMinimum(i);
      
      for (let j = i + 1; j < n; j++) {
        setComparing([minIdx, j]);
        await sleep(500);
        
        if (arr[j] < arr[minIdx]) {
          setMinimum(j);
          minIdx = j;
        }
      }
      
      if (minIdx !== i) {
        setSwapping([i, minIdx]);
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        setArray([...arr]);
        await sleep(500);
      }
      
      setSortedIndices(prev => [...prev, i]);
    }
    finishSorting(n);
  };

  const insertionSort = async () => {
    const arr = [...array];
    const n = arr.length;

    for (let i = 1; i < n; i++) {
      const key = arr[i];
      setCurrent(i);
      await sleep(500);

      let j = i - 1;
      while (j >= 0 && arr[j] > key) {
        setComparing([j, j + 1]);
        await sleep(500);
        
        arr[j + 1] = arr[j];
        setArray([...arr]);
        setSwapping([j, j + 1]);
        await sleep(500);
        
        j--;
      }
      arr[j + 1] = key;
      setArray([...arr]);
      setSortedIndices(prev => [...prev, i]);
    }
    finishSorting(n);
  };

  const calculateXPosition = (nodeId, depth, totalLevels) => {
    const positionInLevel = nodeId - (Math.pow(2, depth) - 1);
    const totalPositionsInLevel = Math.pow(2, depth);
    const totalWidth = Math.pow(2, totalLevels - 1) * 100;
    const spacing = totalWidth / totalPositionsInLevel;
    return (positionInLevel + 0.5) * spacing - totalWidth / 2;
  };

  const updateNodes = (nodeId, values, status = 'dividing') => {
    const depth = Math.floor(Math.log2(nodeId + 1));
    const totalLevels = Math.ceil(Math.log2(array.length)) + 1;
    
    setTreeNodes(prev => {
      const newNodes = prev.filter(node => node.id !== nodeId || node.status !== 'merged');
      const xPos = calculateXPosition(nodeId, depth, totalLevels);
      
      return [...newNodes, {
        id: nodeId,
        values: [...values],
        depth,
        xPos,
        status
      }];
    });
  };

  const merge = async (arr, low, mid, high, nodeId) => {
    const leftArr = arr.slice(low, mid + 1);
    const rightArr = arr.slice(mid + 1, high + 1);
    
    updateNodes(nodeId * 2 + 1, leftArr, 'sorted');
    updateNodes(nodeId * 2 + 2, rightArr, 'sorted');
    await sleep(1000);

    const merged = [];
    let i = 0, j = 0;
    
    while (i < leftArr.length && j < rightArr.length) {
      setComparing([low + i, mid + 1 + j]);
      await sleep(500);
      
      if (leftArr[i] <= rightArr[j]) {
        merged.push(leftArr[i++]);
      } else {
        merged.push(rightArr[j++]);
      }
    }
    
    while (i < leftArr.length) merged.push(leftArr[i++]);
    while (j < rightArr.length) merged.push(rightArr[j++]);

    for (let k = 0; k < merged.length; k++) {
      arr[low + k] = merged[k];
      setArray([...arr]);
      await sleep(200);
    }

    updateNodes(nodeId, merged, 'merged');
    setComparing([-1, -1]);
    
    await sleep(500);

    setTreeNodes(prev => prev.filter(node => 
      node.id !== nodeId * 2 + 1 && node.id !== nodeId * 2 + 2
    ));
  };

  const mergeSort = async (arr, low, high, nodeId = 0) => {
    if (low < high) {
      const mid = Math.floor((low + high) / 2);
      
      const leftArr = arr.slice(low, mid + 1);
      const rightArr = arr.slice(mid + 1, high + 1);
      
      updateNodes(nodeId * 2 + 1, leftArr);
      updateNodes(nodeId * 2 + 2, rightArr);
      await sleep(1000);

      await mergeSort(arr, low, mid, nodeId * 2 + 1);
      await mergeSort(arr, mid + 1, high, nodeId * 2 + 2);
      
      await merge(arr, low, mid, high, nodeId);
    }
  };

  const quickSort = async (arr, low, high) => {
    if (low < high) {
      let pivot = arr[low];
      setPivotIndex(low);
      await sleep(500);

      let i = low;
      let j = high;

      while (i < j) {
        while (arr[i] <= pivot && i <= high - 1) {
          setComparing([i, pivotIndex]);
          await sleep(500);
          i++;
        }

        while (arr[j] > pivot && j >= low + 1) {
          setComparing([j, pivotIndex]);
          await sleep(500);
          j--;
        }

        if (i < j) {
          setSwapping([i, j]);
          [arr[i], arr[j]] = [arr[j], arr[i]];
          setArray([...arr]);
          await sleep(500);
        }
      }

      setSwapping([low, j]);
      [arr[low], arr[j]] = [arr[j], arr[low]];
      setArray([...arr]);
      await sleep(500);

      setPivotIndex(j);
      setSortedIndices(prev => [...prev, j]);
      
      await quickSort(arr, low, j - 1);
      await quickSort(arr, j + 1, high);
    }
  };

  const startSort = async () => {
    setIsSorting(true);
    setSortedIndices([]);
    const arr = [...array];
    
    if (algorithm === "bubble") {
      await bubbleSort();
    } else if (algorithm === "selection") {
      await selectionSort();
    } else if (algorithm === "insertion") {
      await insertionSort();
    } else if (algorithm === "merge") {
      setTreeNodes([]);
      const arr = [...array];
      updateNodes(0, arr);
      await sleep(500);
      await mergeSort(arr, 0, arr.length - 1);
      finishSorting(arr.length);
    } else if (algorithm === "quick") {
      await quickSort(arr, 0, arr.length - 1);
      finishSorting(arr.length);
    }
  };

  
  const Node = ({ values, depth, xPos, status }) => (
    <div
      className="absolute transition-all duration-500 flex gap-2"
      style={{
        transform: `translate(${xPos}px, ${depth * 120}px)`,
        left: '50%',
        top: '20px'
      }}
    >
      {values.map((value, idx) => (
        <div
          key={idx}
          className={`w-10 h-10 flex items-center justify-center rounded-lg 
            ${status === 'merged' ? 'bg-green-200 text-black' : 
              status === 'sorted' ? 'bg-yellow-200 text-black' :
              'bg-blue-200 text-black'} 
            border-2 shadow-md transition-all duration-300`}
        >
          {value}
        </div>
      ))}
    </div>
  );

  const finishSorting = (n) => {
    setIsSorting(false);
    setIsSorted(true);
    setSortedIndices(Array.from({ length: n }, (_, i) => i));
  };

  const resetSort = () => {
    setArray([]);
    setArraySize(0);
    setTempArray([]);
    setComparing([-1, -1]);
    setSwapping([-1, -1]);
    setMinimum(-1);
    setCurrent(-1);
    setSortedIndices([]);
    setTreeNodes([]);
    setIsInitialized(false);
    setIsSorted(false);
    setIsSorting(false);
    setAlgorithm("");
    setMessage("");
    setPivotIndex(-1);
    setMergingIndices([]);
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Sorting Algorithm Visualizer</h1>
      
      <div className="max-w-4xl mx-auto">
        {!isInitialized ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <select 
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                className="w-64 p-2 rounded text-black"
              >
                <option value="">Select Algorithm</option>
                <option value="bubble">Bubble Sort</option>
                <option value="selection">Selection Sort</option>
                <option value="insertion">Insertion Sort</option>
                <option value="merge">Merge Sort</option>
                <option value="quick">Quick Sort</option>
              </select>

              {algorithm && (
                <input
                  type="number"
                  min="1"
                  placeholder="Enter array size"
                  value={arraySize || ""}
                  onChange={handleArraySizeChange}
                  className="w-64 p-2 rounded text-black"
                />
              )}
            </div>

            {arraySize > 0 && (
              <div className="flex flex-col items-center gap-4">
                <div className="flex flex-wrap justify-center gap-2">
                  {Array.from({ length: arraySize }).map((_, index) => (
                    <input
                      key={index}
                      type="text"
                      value={tempArray[index] || ""}
                      onChange={(e) => handleElementChange(index, e.target.value)}
                      className="w-16 h-16 text-center text-xl rounded bg-gray-800 border border-gray-600 text-white"
                    />
                  ))}
                </div>
                <button
                  onClick={submitArray}
                  className="px-6 py-2 bg-blue-500 rounded hover:bg-blue-500"
                >
                  Initialize Array
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center gap-4">
              {!isSorting && !isSorted && (
                <button
                  onClick={startSort}
                  className="px-6 py-2 bg-green-500 rounded hover:bg-green-600"
                >
                  Start Sorting
                </button>
              )}
              <button
                onClick={resetSort}
                className="px-6 py-2 bg-gray-600 rounded hover:bg-gray-700"
              >
                Reset
              </button>
            </div>
            {algorithm === 'merge' ? (
            <div className="relative" style={{ 
              height: `${(Math.ceil(Math.log2(array.length)) + 2) * 140}px`,
              width: '100%',
              overflow: 'auto'
            }}>
              {treeNodes.map((node) => (
                <Node
                  key={node.id}
                  values={node.values}
                  depth={node.depth}
                  xPos={node.xPos}
                  status={node.status}
                />
              ))}
            </div>
          ) : (


            <div className="flex justify-center items-center gap-2 flex-wrap min-h-[200px]">
              {array.map((value, index) => (
                <div
                  key={index}
                  className={`w-16 h-16 flex items-center justify-center rounded-lg text-xl transition-colors duration-300 ${
                    sortedIndices.includes(index)
                      ? "bg-green-500"
                      : index === pivotIndex
                      ? "bg-yellow-500"
                      : index === minimum
                      ? "bg-purple-500"
                      : comparing.includes(index)
                      ? "bg-yellow-500"
                      : swapping.includes(index)
                      ? "bg-red-500"
                      : mergingIndices.includes(index)
                      ? "bg-orange-500"
                      : "bg-gray-700"
                  }`}
                >
                  {value}
                </div>
              ))}
            </div>
          )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
