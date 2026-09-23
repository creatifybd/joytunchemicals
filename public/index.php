<?php
// Hostinger renders crawlable metadata and content before the React application loads.
// Firestore REST reads use public security rules. No privileged credential is used.
$defaults = json_decode(file_get_contents(__DIR__ . '/seo-defaults.json'), true);
if (!$defaults) { include __DIR__ . '/index.html'; exit; }
function field_value($v) {
    if (isset($v['stringValue'])) return $v['stringValue'];
    if (isset($v['booleanValue'])) return $v['booleanValue'];
    if (isset($v['integerValue'])) return (int)$v['integerValue'];
    if (isset($v['doubleValue'])) return $v['doubleValue'];
    if (isset($v['arrayValue'])) return array_map('field_value', $v['arrayValue']['values'] ?? []);
    if (isset($v['mapValue'])) return fields_value($v['mapValue']['fields'] ?? []);
    return null;
}
function fields_value($fields) { $result=[]; foreach($fields as $k=>$v) $result[$k]=field_value($v); return $result; }
function public_read($url) {
    if (function_exists('curl_init')) {
        $ch=curl_init($url); curl_setopt_array($ch,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_CONNECTTIMEOUT=>1,CURLOPT_TIMEOUT=>2,CURLOPT_FOLLOWLOCATION=>false]);
        $text=curl_exec($ch);$code=curl_getinfo($ch,CURLINFO_HTTP_CODE);curl_close($ch);
        return $code===200 ? json_decode($text,true) : null;
    }
    $context=stream_context_create(['http'=>['timeout'=>2,'ignore_errors'=>true]]);
    $text=@file_get_contents($url,false,$context);return $text?json_decode($text,true):null;
}
$site=$defaults['site'];$products=$defaults['products'];
$project=$defaults['project'];
if (preg_match('/^[a-z0-9-]+$/',$project)) {
    $cache=sys_get_temp_dir().'/joytun-public-'.hash('sha256',$project).'.json';
    $cached=is_file($cache)?json_decode(@file_get_contents($cache),true):null;
    if (!$cached || time()-($cached['time']??0)>30) {
        $base='https://firestore.googleapis.com/v1/projects/'.rawurlencode($project).'/databases/(default)/documents/';
        $company=public_read($base.'settings/company');
        $catalogue=public_read($base.'products?pageSize=1000');
        $next=['time'=>time(),'website'=>$cached['website']??null,'products'=>$cached['products']??[]];
        if(isset($company['fields']))$next['website']=fields_value($company['fields'])['website']??null;
        if(isset($catalogue['documents'])&&!isset($catalogue['nextPageToken'])){
            $next['products']=array_map(function($doc){$p=fields_value($doc['fields']??[]);$p['id']=basename($doc['name']);return $p;},$catalogue['documents']);
        }
        $cached=$next;@file_put_contents($cache,json_encode($cached),LOCK_EX);
    }
    // Recursive merge for objects, replacement for editorial lists (including empty lists).
    function merge_site($base,$saved){foreach($base as $key=>$v){if(!array_key_exists($key,$saved))continue;$new=$saved[$key];$base[$key]=is_array($v)&&array_keys($v)!==range(0,count($v)-1)&&is_array($new)?merge_site($v,$new):$new;}return $base;}
    if(is_array($cached['website']??null))$site=merge_site($site,$cached['website']);
    $byId=[];foreach($products as $p)$byId[$p['id']]=$p;
    $legacy=['2VqKcNhGaJDDdcQ5jz8P','GSCF1oQTMfNZOwoF4MBD','UPchN0eAp36hMXbvSZcb','YW0IEk3seLxFLGRGfPpR','qFZbsuOBjzvf9tFB4MFP','tWAIvhaR4gpd53qA4OaE'];
    foreach($cached['products']??[] as $p){if(in_array($p['id'],$legacy,true))continue;$byId[$p['id']]=array_merge($byId[$p['id']]??[],$p);}
    $products=array_values(array_filter($byId,function($p){return !preg_match('/baby|শিশু/iu',($p['name']??'').' '.($p['cat']??'').' '.($p['category']??''));}));
}
$site['brand']['location']='Kanchpur, Sonargaon, Narayanganj, Bangladesh.';
$origin=$defaults['origin'];$path=parse_url($_SERVER['REQUEST_URI']??'/',PHP_URL_PATH);$path=rtrim($path,'/')?:'/';
function esc($text){return htmlspecialchars((string)$text,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8');}
function safe_url($url,$fallback='/'){return is_string($url)&&preg_match('#^(?:/(?!/)|https://[^\s]+)#',$url)?$url:$fallback;}
function absolute_url($url){global $origin;$url=safe_url($url);return strpos($url,'https://')===0?$url:$origin.$url;}
function product_path($p){return '/products/'.rawurlencode($p['slug']??$p['id']);}
$active=array_values(array_filter($products,function($p){return ($p['status']??'')==='active';}));
if($path==='/sitemap.xml'){
 header('Content-Type: application/xml; charset=utf-8');echo '<?xml version="1.0" encoding="UTF-8"?>';echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
 if($site['seo']['indexable'])foreach(array_merge(['/','/products','/about','/contact'],array_map('product_path',$active)) as $p)echo '<url><loc>'.esc($origin.$p).'</loc></url>';
 echo '</urlset>';exit;
}
$slug=null;if(preg_match('#^/products/([^/]+)$#',$path,$match))$slug=rawurldecode($match[1]);
if(!$slug&&isset($_GET['product']))$slug=$_GET['product'];
$product=null;foreach($active as $p)if(($p['slug']??$p['id'])===$slug){$product=$p;break;}
$admin=strpos($path,'/admin')===0;
$known=in_array($path,['/','/products','/about','/contact','/index.php','/index.html'],true);
$missing=!$known&&!$product&&!$admin;
if($missing)http_response_code(404);
$key=$path==='/about'?'about':($path==='/contact'?'contact':(strpos($path,'/products')===0?'products':'home'));
$title=$site['seo'][$key]['title'];$description=$site['seo'][$key]['description'];
if($product){$title=$product['seoTitle']??'';$title=$title?:$product['name'].' — '.($product['variant']??'Product').' | Joytun';$description=($product['seoDescription']??'')?:($product['desc']??$description);}
if($admin)$title='Website Studio | Joytun';if($missing)$title='Page not found | Joytun';
$canonical=$origin.($product?product_path($product):($known&&!in_array($path,['/index.php','/index.html'])?$path:'/'));
$image=absolute_url($product?($product['images'][0]??$product['img']??$site['seo']['image']):$site['seo']['image']);
$robots=$admin?'noindex,nofollow':(($missing||isset($_GET['q'])||isset($_GET['search'])||isset($_GET['preview'])||!$site['seo']['indexable'])?'noindex,follow':'index,follow,max-image-preview:large');
$organization=['@type'=>'Organization','@id'=>$origin.'/#organization','name'=>$site['brand']['name'],'url'=>$origin,'logo'=>absolute_url($site['brand']['logo']),'email'=>$site['brand']['email'],'telephone'=>$site['brand']['phone'],'address'=>['@type'=>'PostalAddress','streetAddress'=>$site['brand']['location'],'addressCountry'=>'BD']];
$graph=[$organization,['@type'=>'WebSite','@id'=>$origin.'/#website','url'=>$origin,'name'=>$site['brand']['name'],'publisher'=>['@id'=>$origin.'/#organization']],['@type'=>'WebPage','@id'=>$canonical.'#page','url'=>$canonical,'name'=>$title,'description'=>$description,'isPartOf'=>['@id'=>$origin.'/#website']]];
if($path!=='/'){$items=[['@type'=>'ListItem','position'=>1,'name'=>'Home','item'=>$origin.'/'],['@type'=>'ListItem','position'=>2,'name'=>$product?'Our products':ucfirst($key),'item'=>$product?$origin.'/products':$canonical]];if($product)$items[]=['@type'=>'ListItem','position'=>3,'name'=>$product['name'],'item'=>$canonical];$graph[]=['@type'=>'BreadcrumbList','itemListElement'=>$items];}
if($product)$graph[]=['@type'=>'Product','@id'=>$canonical.'#product','name'=>$product['name'].' '.($product['variant']??''),'description'=>$description,'image'=>$image,'sku'=>$product['slug']??$product['id'],'brand'=>['@type'=>'Brand','name'=>$product['brand']??$site['brand']['shortName']],'manufacturer'=>['@id'=>$origin.'/#organization']];
if($key==='products'&&!$product){$items=[];foreach($active as $i=>$p)$items[]=['@type'=>'ListItem','position'=>$i+1,'name'=>$p['name'],'url'=>$origin.product_path($p)];$graph[]=['@type'=>'ItemList','itemListElement'=>$items];}
$head='<title>'.esc($title).'</title><meta name="description" content="'.esc($description).'"><meta name="robots" content="'.esc($robots).'"><link rel="canonical" href="'.esc($canonical).'">';
foreach(['og:title'=>$title,'og:description'=>$description,'og:url'=>$canonical,'og:image'=>$image,'og:type'=>'website','og:site_name'=>$site['brand']['name']] as $k=>$v)$head.='<meta property="'.esc($k).'" content="'.esc($v).'">';
foreach(['twitter:card'=>'summary_large_image','twitter:title'=>$title,'twitter:description'=>$description,'twitter:image'=>$image] as $k=>$v)$head.='<meta name="'.esc($k).'" content="'.esc($v).'">';
$flags=JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT|JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE;
$head.='<script id="joytun-schema" type="application/ld+json">'.json_encode(['@context'=>'https://schema.org','@graph'=>$graph],$flags).'</script>';
$head.='<script>window.__JOYTUN_PUBLIC__='.json_encode(['site'=>$site,'products'=>$products],$flags).';</script>';
$html=file_get_contents(__DIR__.'/index.html');
$html=preg_replace('#<title>.*?</title>#s','',$html);
$html=preg_replace('#<meta\s+(?:name="(?:description|robots|twitter:[^"]+)"|property="og:[^"]+")[^>]*>#i','',$html);
$html=str_replace('</head>',$head.'</head>',$html);
$body='<div class="public-site"><header class="shell" style="padding:24px"><a href="/">'.esc($site['brand']['name']).'</a><nav>';foreach($site['navigation'] as $n)$body.='<a style="margin-right:20px" href="'.esc(safe_url($n['url'])).'">'.esc($n['label']).'</a>';$body.='</nav></header><main class="shell section-space">';
$heading=$product?($product['name'].' '.($product['variant']??'')):($admin?'Website studio':($missing?'Page not found':$site[$key==='products'?'products':$key]['title']));
$body.='<h1>'.nl2br(esc($heading)).'</h1><p>'.esc($description).'</p>';
if($product)$body.='<img style="width:280px;max-width:100%" src="'.esc($image).'" alt="'.esc($product['name']).'"><p>'.esc($product['desc']??'').'</p><a href="/contact">Enquire about this product</a>';
elseif(!$admin&&!$missing){$body.='<p>'.esc($site['brand']['location']).'</p>';if($key==='home'||$key==='products'){$body.='<ul>';foreach($active as $p)$body.='<li><a href="'.esc(product_path($p)).'">'.esc($p['name'].' '.($p['variant']??'').' '.($p['format']??'')).'</a></li>';$body.='</ul>';}if($key==='about')$body.='<p>'.esc($site['about']['lead']).'</p><p>'.esc($site['about']['paragraph1']).'</p><p>'.esc($site['about']['paragraph2']).'</p>';if($key==='contact')$body.='<a href="mailto:'.esc($site['brand']['email']).'">'.esc($site['brand']['email']).'</a><p>'.esc($site['brand']['phone']).'</p>';}
$body.='</main></div>';
$html=str_replace('<div id="root"></div>','<div id="root">'.$body.'</div>',$html);
header('Content-Type: text/html; charset=utf-8');header('Cache-Control: no-cache');echo $html;
