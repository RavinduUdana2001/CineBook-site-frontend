import React, { useEffect, useState } from "react";
import { http } from "../api/http";

export default function Admin() {
  const [movies, setMovies] = useState([]);
  const [halls, setHalls] = useState([]);
  const [msg, setMsg] = useState("");

  const [mTitle, setMTitle] = useState("");
  const [mGenre, setMGenre] = useState("");
  const [mDur, setMDur] = useState(120);

  const [hName, setHName] = useState("");
  const [hRows, setHRows] = useState(10);
  const [hCols, setHCols] = useState(12);

  async function refresh() {
    const [m, h] = await Promise.all([http.get("/movies"), http.get("/halls")]);
    setMovies(m.data);
    setHalls(h.data);
  }

  useEffect(() => { refresh(); }, []);

  async function addMovie(e) {
    e.preventDefault();
    setMsg("");
    await http.post("/movies", { title: mTitle, genre: mGenre, durationMins: Number(mDur) });
    setMTitle(""); setMGenre(""); setMDur(120);
    setMsg("✅ Movie added");
    refresh();
  }

  async function addHall(e) {
    e.preventDefault();
    setMsg("");
    await http.post("/halls", { name: hName, rows: Number(hRows), cols: Number(hCols) });
    setHName(""); setHRows(10); setHCols(12);
    setMsg("✅ Hall added");
    refresh();
  }

  return (
    <div className="container py-4 text-white">
      <h2 className="mb-1">Admin Panel</h2>
      <div className="text-dim mb-3">Manage movies and halls. (Shows page can be added next)</div>

      {msg && <div className="alert alert-success">{msg}</div>}

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="card card-glass">
            <div className="card-body">
              <h5 className="mb-3">Add Movie</h5>
              <form onSubmit={addMovie} className="vstack gap-2">
                <input className="form-control" placeholder="Title" value={mTitle} onChange={e=>setMTitle(e.target.value)} required />
                <input className="form-control" placeholder="Genre" value={mGenre} onChange={e=>setMGenre(e.target.value)} />
                <input className="form-control" type="number" placeholder="Duration (mins)" value={mDur} onChange={e=>setMDur(e.target.value)} />
                <button className="btn btn-primary">Add Movie</button>
              </form>

              <hr className="border-light opacity-25" />

              <h6>Existing Movies</h6>
              <div className="vstack gap-2">
                {movies.map(m => (
                  <div key={m._id} className="p-2 rounded" style={{background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.12)"}}>
                    <div className="fw-semibold">{m.title}</div>
                    <div className="small text-dim">{m.genre} • {m.durationMins} mins</div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card card-glass">
            <div className="card-body">
              <h5 className="mb-3">Add Hall</h5>
              <form onSubmit={addHall} className="vstack gap-2">
                <input className="form-control" placeholder="Hall name" value={hName} onChange={e=>setHName(e.target.value)} required />
                <div className="row g-2">
                  <div className="col">
                    <input className="form-control" type="number" placeholder="Rows" value={hRows} onChange={e=>setHRows(e.target.value)} />
                  </div>
                  <div className="col">
                    <input className="form-control" type="number" placeholder="Cols" value={hCols} onChange={e=>setHCols(e.target.value)} />
                  </div>
                </div>
                <button className="btn btn-primary">Add Hall</button>
              </form>

              <hr className="border-light opacity-25" />

              <h6>Existing Halls</h6>
              <div className="vstack gap-2">
                {halls.map(h => (
                  <div key={h._id} className="p-2 rounded" style={{background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.12)"}}>
                    <div className="fw-semibold">{h.name}</div>
                    <div className="small text-dim">{h.rows} rows × {h.cols} cols</div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
