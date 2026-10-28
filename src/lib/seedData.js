// Realistic seed data for Sanctuary Journal

const getPastDate = (daysAgo) => {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().split('T')[0]
}

export const INITIAL_SECTIONS = [
  {
    id: 'cs',
    title: 'Computer Science',
    subtitle: 'Algorithms, data structures & core fundamentals',
    description: 'Tranquil daily reflections on computational thinking, algorithmic intuition, and system design insights.',
    icon: 'Terminal',
    accentColor: '#84A59D',
    categories: ['DSA', 'Systems', 'Networking', 'Operating Systems', 'Databases'],
    subTopicsMap: {
      DSA: [
        'Graphs',
        'Sliding Window',
        'Trees',
        'Dynamic Programming',
        'Two Pointers',
        'Binary Search',
        'Recursion',
        'Heaps'
      ],
      Systems: ['Concurrency', 'Distributed Systems', 'Caches', 'Memory Management'],
      Networking: ['TCP/IP', 'DNS', 'HTTP/3', 'WebSockets'],
      'Operating Systems': ['Virtual Memory', 'Process Scheduling', 'Deadlocks']
    }
  }
]

export const generateSeedEntries = () => {
  const today = getPastDate(0)
  const twoDaysAgo = getPastDate(2)
  const fourDaysAgo = getPastDate(4)
  const sixDaysAgo = getPastDate(6)
  const eightDaysAgo = getPastDate(8)

  return [
    {
      id: 'entry-seed-1',
      sectionId: 'cs',
      title: 'Dijkstra as Greedy BFS: The Power of Weighted Priority',
      date: today,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: 'DSA',
      subTopic: 'Graphs',
      tags: ['Graphs', 'Dijkstra', 'Priority Queue', 'Shortest Path'],
      readingTime: '4 min read',
      complexity: { time: 'O((V + E) log V)', space: 'O(V + E)' },
      takeaway: 'Dijkstra is not a wholly new algorithm; it is simply BFS swapping a standard FIFO queue for a min-heap prioritizing accumulated distance.',
      preview: 'Today the connection between unweighted BFS and Dijkstra finally clicked intuitively. When edge weights are uniform (1), standard level-order BFS expands in concentric ripples...',
      content: `<h2>The Intuitive Bridge: BFS to Dijkstra</h2>
<p>For a long time, Dijkstra felt like an isolated algorithm with tricky state bookkeeping. Today, unpacking it line-by-line revealed the elegance: <strong>it is fundamentally just Breadth-First Search</strong>, but instead of expanding by hop count, we expand by minimum cumulative edge weight.</p>
<blockquote>Aha! Moment: In unweighted graphs, a FIFO queue naturally guarantees that the first time we visit a node, we arrived via the fewest edges. In weighted graphs, replacing that queue with a Min-Heap (Priority Queue) restores that exact invariant for total path cost.</blockquote>
<h3>Dry-Run & Python Implementation</h3>
<p>Here is the canonical implementation using Python's <code>heapq</code>:</p>
<pre><code>import heapq

def dijkstra(graph, start):
    # distances dictionary initialized to infinity
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    pq = [(0, start)]  # (current_distance, node)
    
    while pq:
        curr_dist, u = heapq.heappop(pq)
        
        # Lazy deletion: skip if we found a shorter path already
        if curr_dist > distances[u]:
            continue
            
        for neighbor, weight in graph[u].items():
            distance = curr_dist + weight
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                heapq.heappush(pq, (distance, neighbor))
                
    return distances</code></pre>
<h3>Key Complexity Notes</h3>
<ul>
  <li><strong>Time Complexity:</strong> <code>O((V + E) log V)</code> with adjacency list and binary heap. Each edge is relaxed at most once, inserting into the heap takes <code>O(log V)</code>.</li>
  <li><strong>Space Complexity:</strong> <code>O(V + E)</code> to store graph and distances array.</li>
  <li><strong>Limitation:</strong> Does not handle negative edge weights because the greedy choice property assumes adding an edge only increases path length!</li>
</ul>`
    },
    {
      id: 'entry-seed-2',
      sectionId: 'cs',
      title: 'Sliding Window Invariant: Shrink Only When Violated',
      date: twoDaysAgo,
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      category: 'DSA',
      subTopic: 'Sliding Window',
      tags: ['Sliding Window', 'Two Pointers', 'Substrings', 'Hash Map'],
      readingTime: '3 min read',
      complexity: { time: 'O(N)', space: 'O(K) where K is alphabet size' },
      takeaway: 'The right pointer enthusiastically acquires new elements; the left pointer conservatively contracts only when the window invariant breaks.',
      preview: 'Explored variable-size sliding window patterns today on "Longest Substring Without Repeating Characters". The mental model is an expanding caterpillar...',
      content: `<h2>The "Caterpillar" Mental Model</h2>
<p>Whenever a problem asks for an optimal contiguous subarray or substring under a condition (e.g. at most <code>k</code> distinct characters, sum &ge; <code>S</code>), Sliding Window is the primary mental tool.</p>
<blockquote>Insight: The right pointer extends greedily forward to introduce fresh state. The left pointer catches up only as needed to repair the broken invariant. Because both pointers advance at most N times, the overall runtime remains strictly linear O(2N) = O(N).</blockquote>
<h3>Template & Code</h3>
<pre><code>def length_of_longest_substring(s: str) -> int:
    char_map = {}
    left = 0
    max_len = 0
    
    for right, char in enumerate(s):
        if char in char_map and char_map[char] >= left:
            # Jump left pointer directly past the last duplicate
            left = char_map[char] + 1
            
        char_map[char] = right
        max_len = max(max_len, right - left + 1)
        
    return max_len</code></pre>
<p>By mapping the character directly to its latest seen index, <code>left</code> can skip multiple steps in one jump rather than stepping one-by-one!</p>`
    },
    {
      id: 'entry-seed-3',
      sectionId: 'cs',
      title: 'Binary Tree Traversals: Recursive Call Stack vs Morris Traversal',
      date: fourDaysAgo,
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      category: 'DSA',
      subTopic: 'Trees',
      tags: ['Trees', 'Binary Trees', 'Morris Traversal', 'Inorder'],
      readingTime: '5 min read',
      complexity: { time: 'O(N)', space: 'O(1) auxiliary (Morris)' },
      takeaway: 'Morris Traversal temporarily borrows right pointers of in-order predecessors as threading bridges, achieving O(1) space without explicit recursion or stacks.',
      preview: 'Investigated tree traversals today. While standard recursion is delightfully clean, in memory-constrained environments the O(H) call stack can overflow on skewed trees...',
      content: `<h2>Beyond Standard Recursion</h2>
<p>In standard recursive traversal, the call stack implicitly tracks the path back up the tree, consuming <code>O(H)</code> space where <code>H</code> can be <code>O(N)</code> in degenerate skewed trees.</p>
<blockquote>Aha! Moment: Threaded Binary Trees & Morris Traversal eliminate this overhead by temporarily modifying the tree structure: point the predecessor's right null pointer directly to the current node, then restore it on the second visit!</blockquote>
<h3>The Morris In-Order Elegance</h3>
<pre><code>def morris_inorder_traversal(root):
    result = []
    curr = root
    
    while curr:
        if not curr.left:
            result.append(curr.val)
            curr = curr.right
        else:
            # Find in-order predecessor
            pred = curr.left
            while pred.right and pred.right != curr:
                pred = pred.right
                
            if not pred.right:
                # Establish temporary thread
                pred.right = curr
                curr = curr.left
            else:
                # Thread exists: revert change and visit node
                pred.right = None
                result.append(curr.val)
                curr = curr.right
                
    return result</code></pre>
<p>Every edge is traversed at most 3 times, yielding a pristine <code>O(N)</code> time and true <code>O(1)</code> auxiliary space!</p>`
    },
    {
      id: 'entry-seed-4',
      sectionId: 'cs',
      title: 'Dynamic Programming: 0/1 Knapsack & Space Optimization to 1D',
      date: sixDaysAgo,
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      category: 'DSA',
      subTopic: 'Dynamic Programming',
      tags: ['Dynamic Programming', 'Knapsack', 'Space Optimization'],
      readingTime: '4 min read',
      complexity: { time: 'O(N * W)', space: 'O(W)' },
      takeaway: 'Iterating backward across capacity when compressing 2D DP to 1D ensures each item is only chosen once, preventing values from earlier in the same row from leaking forward.',
      preview: 'Delved into 0/1 Knapsack recurrence today. The transition from a 2D table dp[i][w] to a single 1D array dp[w] felt like pure magic until realizing why reverse iteration is crucial...',
      content: `<h2>Understanding 1D Space Compression</h2>
<p>The standard recurrence for 0/1 Knapsack considers whether to include item <code>i</code>:</p>
<pre><code>dp[i][w] = max(dp[i-1][w], dp[i-1][w - weight[i]] + val[i])</code></pre>
<p>Notice that row <code>i</code> only depends on the previous row <code>i-1</code>. We can condense this to a single 1D array of size <code>W + 1</code>.</p>
<blockquote>Crucial Detail: When updating <code>dp[w]</code>, we MUST traverse <code>w</code> from <code>W</code> down to <code>weight[i]</code> (backward). If we went forward, <code>dp[w - weight[i]]</code> would already contain the result from the CURRENT item, accidentally converting 0/1 Knapsack into Unbounded Knapsack!</blockquote>
<pre><code>def knapsack_01(weights, values, W):
    dp = [0] * (W + 1)
    
    for weight, val in zip(weights, values):
        # Traverse backwards to preserve previous subproblem state
        for w in range(W, weight - 1, -1):
            dp[w] = max(dp[w], dp[w - weight] + val)
            
    return dp[W]</code></pre>`
    },
    {
      id: 'entry-seed-5',
      sectionId: 'cs',
      title: 'Breadth-First Search: Topological Sort via Kahn\'s In-Degree Algorithm',
      date: eightDaysAgo,
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      category: 'DSA',
      subTopic: 'Graphs',
      tags: ['Graphs', 'Topological Sort', 'DAG', 'Kahn Algorithm'],
      readingTime: '3 min read',
      complexity: { time: 'O(V + E)', space: 'O(V + E)' },
      takeaway: 'A node with 0 in-degrees is completely unconstrained: we can safely process it immediately and peel off its outbound dependencies.',
      preview: 'Practiced Course Schedule II today. Visualizing dependency resolution as peeling layers of an onion: nodes with in-degree 0 have no prerequisites...',
      content: `<h2>Resolving Dependencies in Directed Acyclic Graphs</h2>
<p>Topological sorting arranges vertices in a linear order such that for every directed edge <code>u &rarr; v</code>, <code>u</code> comes before <code>v</code>.</p>
<blockquote>Aha! Moment: Kahn's algorithm is essentially dependency pruning. Maintain an array of in-degrees. Seed the queue with vertices having in-degree 0. As each vertex is consumed, decrement its neighbors' in-degrees. If any reach 0, they unlock for processing!</blockquote>
<h3>Cycle Detection Bonus</h3>
<p>If the final ordered array length is less than <code>V</code>, there must be a cycle! A cycle forms a deadlock where no node in the loop ever drops to in-degree 0.</p>
<pre><code>from collections import deque

def find_order(num_courses, prerequisites):
    adj = {i: [] for i in range(num_courses)}
    in_degree = [0] * num_courses
    
    for dest, src in prerequisites:
        adj[src].append(dest)
        in_degree[dest] += 1
        
    queue = deque([i for i in range(num_courses) if in_degree[i] == 0])
    order = []
    
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in adj[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
                
    return order if len(order) == num_courses else []</code></pre>`
    }
  ]
}
