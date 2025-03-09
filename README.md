# How To Use 

## Here some sample PHP showing how to call the servce

```
  function nodeWebPageInfo($furl){
      // get the IP address of your service from a database or config file out side of the server root!
      
      $node = $rec['dnodAddress'];
      $host = "https://".$node.":13385";
      $url  = "/netREQ/msg=";
      $j = new stdClass;
      $j->action = 'fetchWScrShot';
      $j->url    = $furl;
      $j->width  = 1280;
      $j->height = 800;
      $j->uAgent = $_SERVER['HTTP_USER_AGENT'];

      $req = json_encode($j);
      $jres  = tryFetchURL($host.'/netREQ/msg='.mkyUrlEncode($req));
      $jr = json_decode($jres);
      if ($jr){
        if ($jr->result && $jr->response == 200){
          return $jr;
        }
      }
      fail('Failed To Get Screen Shot');
      return null;
    }
function tryFetchURL($myURL,$t=5,$allowLocal=false){
  if (isLocalHost($myURL)){
    if (!$allowLocal){
      return null;
    }
  }
  $crl = curl_init();
  $timeout = $t;
  curl_setopt ($crl, CURLOPT_SSL_VERIFYHOST, 0);
  curl_setopt ($crl, CURLOPT_SSL_VERIFYPEER, 0);
  curl_setopt ($crl, CURLOPT_URL,$myURL);
  curl_setopt ($crl, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt ($crl, CURLOPT_CONNECTTIMEOUT, $timeout);
  curl_setopt ($crl, CURLOPT_FOLLOWLOCATION, true);
  curl_setopt ($crl, CURLOPT_USERAGENT,safeSRV('HTTP_USER_AGENT'));
  curl_setopt ($crl, CURLOPT_MAXREDIRS,5);
  if (isset($_SERVER['HTTP_REFERER'])){
    curl_setopt ($crl, CURLOPT_REFERER, $_SERVER['HTTP_REFERER']);
  }
  else {
    curl_setopt ($crl, CURLOPT_REFERER, 'www.bitmonky.com');
  }
  $ret = curl_exec($crl);
  curl_close($crl);
  return $ret;
}
```


