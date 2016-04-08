import numpy as np
import threading
import redis, json
import web.gol, time

class GOL:
    runningThread = None
    run = True
    def __init__(self):
        pass

    def life_step(self, X):
        """Game of life step using generator expressions"""
        X = np.asarray(X).astype(bool)
        nbrs_count = sum(np.roll(np.roll(X, i, 0), j, 1)
                         for i in (-1, 0, 1) for j in (-1, 0, 1)
                         if (i != 0 or j != 0))
        return (nbrs_count == 3) | (X & (nbrs_count == 2))

    def _run(self, X):
        r = redis.StrictRedis(host='redis', port=6379, db=0)
        while(self.run):
            X = self.life_step(X)
            r.lpush('steps', json.dumps({'data': X.astype(int).tolist()}))
            time.sleep(0.2)

    def start(self, X):
        self.run = False
        r = redis.StrictRedis(host='redis', port=6379, db=0)
        r.flushall()
        r.flushdb()
        r.lpush('steps', json.dumps({'data': X.astype(int).tolist()}))
        self.run = True
        self.runningThread = threading.Thread(target=self._run, args=(X,))
        self.runningThread.start()

    def get_step(self):
        if not self.run:
            return {}
        r = redis.StrictRedis(host='redis', port=6379, db=0)
        data = r.rpop('steps')
        if data is not None:
            return json.loads(data)
        return {}

    def stop(self):
        self.run = False
        r = redis.StrictRedis(host='redis', port=6379, db=0)
        r.flushall()
        r.flushdb()
