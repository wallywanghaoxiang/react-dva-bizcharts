
import * as path from 'path';
import child_process  from 'child_process';


const {exec} = child_process;

console.log("asgsdgsdfg")

export default ()=>{
  var httpFiber = Fiber.current;
  var cmdStr = `git log -n 1 --pretty=format:'%h%ad'`;
  exec(cmdStr, { cwd: path.join(process.cwd(), 'src/frontlib')}, function(err,stdout,stderr){
    console.log(err,stdout,stderr)
    process.env.TEST_TEST = stdout;
    httpFiber.run();
  });
}



// process.env.TEST_TEST="asdfalsdfjasdfjasdf;asdfjajlsdf";

// console.log(process.env.TEST_TEST)
