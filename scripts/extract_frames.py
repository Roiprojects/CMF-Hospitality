"""Extract every source frame at native resolution into lossless RGB WebP. Requires ffmpeg."""
from pathlib import Path
import subprocess,json,concurrent.futures,hashlib
ROOT=Path(__file__).resolve().parents[1]
JOBS=[('pour','Pouring_cocktail_into_glass_4K_20261012095127.mp4'),('inside','Filming_luxury_cocktail_commerci…_4K_20261012095442.mp4'),('occasions','Cocktail_across_three_celebrations_4K_20261012102157.mp4'),('assembly','Assembling_luxury_cocktail_in_st…_20261012101933(1).mp4'),('inside-alternate','Filming_luxury_cocktail_commerci…_4K_20261012095808(1).mp4')]
def extract(job):
 slug,name=job;src=ROOT/'source-videos'/name;dest=ROOT/'public/frames'/slug;dest.mkdir(parents=True,exist_ok=True)
 probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-of','json',str(src)]));stream=next(x for x in probe['streams'] if x['codec_type']=='video')
 with (dest/'extraction.log').open('w') as log:
  subprocess.run(['ffmpeg','-nostdin','-v','warning','-threads','2','-i',str(src),'-map','0:v:0','-an','-fps_mode','passthrough','-vf','format=bgra','-c:v','libwebp','-lossless','1','-compression_level','2','-threads','2','-start_number','0','-y',str(dest/'%04d.webp')],stderr=log,check=True)
 files=sorted(dest.glob('*.webp'));assert len(files)==int(stream['nb_frames'])
 result={'id':slug,'original':name,'sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'width':stream['width'],'height':stream['height'],'fps':stream['r_frame_rate'],'frames':len(files),'bytes':sum(p.stat().st_size for p in files),'encoding':'lossless WebP from decoded BGRA; no resizing or frame decimation','color_space':stream.get('color_space'),'color_transfer':stream.get('color_transfer'),'color_primaries':stream.get('color_primaries')}
 print(json.dumps(result),flush=True);return result
if __name__=='__main__':
 with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:results=list(pool.map(extract,JOBS))
 (ROOT/'src/content/video-manifest.json').write_text(json.dumps(results,indent=2))
