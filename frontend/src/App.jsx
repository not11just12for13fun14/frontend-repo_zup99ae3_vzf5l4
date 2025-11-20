import { useEffect, useMemo, useState } from 'react'

const BACKEND = import.meta.env.VITE_BACKEND_URL || ''

function ModeToggle({ mode, setMode }){
  return (
    <div className="flex gap-2 p-1 bg-zinc-800 rounded-xl text-sm">
      {['auto','step'].map((m)=> (
        <button key={m} onClick={()=>setMode(m)} className={`px-3 py-1 rounded-lg ${mode===m? 'bg-yellow-400 text-black':'bg-zinc-700 text-white'}`}>
          {m === 'auto' ? 'Fully Auto' : 'Step-by-step'}
        </button>
      ))}
    </div>
  )
}

function ProjectCard({ data }){
  const { project, script, assets } = data || {}
  return (
    <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl text-white space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{project?.title}</h3>
        <span className="text-xs text-zinc-400">{project?.mode}</span>
      </div>
      {script && (
        <div>
          <div className="text-xs uppercase tracking-wide text-zinc-400 mb-1">Script</div>
          <p className="whitespace-pre-wrap text-sm leading-6">{script.text}</p>
        </div>
      )}
      {assets && assets.length>0 && (
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wide text-zinc-400">Assets</div>
          <div className="grid grid-cols-3 gap-2">
            {assets.map((a,i)=> (
              <div key={i} className="aspect-[9/16] bg-zinc-800 rounded-lg overflow-hidden">
                {a.kind==='image' ? (
                  <img src={a.url} className="w-full h-full object-cover" />
                ): a.kind==='voice' ? (
                  <audio controls src={a.url} className="w-full"></audio>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function App(){
  const [mode, setMode] = useState('auto')
  const [title, setTitle] = useState('Epic Wizard Facts in 60 Seconds')
  const [topic, setTopic] = useState('Harry Potter fan theory about Elder Wand')
  const [fandom, setFandom] = useState('harry_potter')
  const [projectId, setProjectId] = useState('')
  const [data, setData] = useState(null)
  const [scriptText, setScriptText] = useState('')
  const [loading, setLoading] = useState(false)

  const loadProject = async (pid)=>{
    const r = await fetch(`${BACKEND}/project/${pid}`)
    const j = await r.json()
    setData(j)
  }

  const create = async ()=>{
    setLoading(true)
    const r = await fetch(`${BACKEND}/project`,{
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ title, topic, mode, fandom })
    })
    const j = await r.json()
    setProjectId(j.project_id)
    await loadProject(j.project_id)
    setLoading(false)
  }

  const doScript = async ()=>{
    if(!projectId) return
    setLoading(true)
    if(mode==='auto'){
      const r = await fetch(`${BACKEND}/script/generate`,{
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ project_id: projectId, topic })
      })
      const j = await r.json()
    } else {
      const r = await fetch(`${BACKEND}/script/provide`,{
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ project_id: projectId, text: scriptText })
      })
      const j = await r.json()
    }
    await loadProject(projectId)
    setLoading(false)
  }

  const doAIImages = async ()=>{
    if(!projectId) return
    setLoading(true)
    const r = await fetch(`${BACKEND}/assets/ai-images`,{
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ project_id: projectId, fandom })
    })
    await r.json()
    await loadProject(projectId)
    setLoading(false)
  }

  const doVoice = async ()=>{
    if(!projectId) return
    setLoading(true)
    const r = await fetch(`${BACKEND}/assets/voice`,{
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ project_id: projectId })
    })
    await r.json()
    await loadProject(projectId)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-white">
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">AI Shorts Studio</h1>
          <ModeToggle mode={mode} setMode={setMode} />
        </header>

        <section className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-4">
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-zinc-400">Title</label>
                <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full mt-1 bg-zinc-800 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="text-sm text-zinc-400">Topic</label>
                <input value={topic} onChange={e=>setTopic(e.target.value)} className="w-full mt-1 bg-zinc-800 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="text-sm text-zinc-400">Fandom</label>
                <select value={fandom} onChange={e=>setFandom(e.target.value)} className="w-full mt-1 bg-zinc-800 rounded-lg px-3 py-2">
                  <option value="harry_potter">Harry Potter</option>
                  <option value="game_of_thrones">Game of Thrones</option>
                  <option value="generic">Generic Fantasy</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={create} disabled={loading} className="px-4 py-2 bg-yellow-400 text-black rounded-lg font-semibold">Create Project</button>
              <button onClick={doScript} disabled={!projectId || loading} className="px-4 py-2 bg-zinc-800 rounded-lg">{mode==='auto'? 'Generate Script' : 'Save Script'}</button>
              <button onClick={doAIImages} disabled={!projectId || loading} className="px-4 py-2 bg-zinc-800 rounded-lg">Generate AI Images</button>
              <button onClick={doVoice} disabled={!projectId || loading} className="px-4 py-2 bg-zinc-800 rounded-lg">Create Voiceover</button>
            </div>

            {mode==='step' && (
              <div className="mt-4">
                <label className="text-sm text-zinc-400">Paste your script</label>
                <textarea value={scriptText} onChange={e=>setScriptText(e.target.value)} rows={8} className="w-full mt-1 bg-zinc-800 rounded-lg px-3 py-2"></textarea>
              </div>
            )}
          </div>

          <div>
            {data && <ProjectCard data={data} />}
          </div>
        </section>

        {!data && (
          <div className="text-zinc-400 text-sm">Create a project to see the script, animated AI images (magic-style loops), and a sample voiceover. Exporting to MP4 will be added next.</div>
        )}
      </div>
    </div>
  )
}
