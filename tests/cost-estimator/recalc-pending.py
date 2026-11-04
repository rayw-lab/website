"""Edit the audit's two yellow cells and check real headless Calc against Python."""
import copy
import csv
from decimal import Decimal, ROUND_HALF_UP
import json
from pathlib import Path
import subprocess
import sys
import xml.etree.ElementTree as ET
import zipfile

sys.path.insert(0, '/Users/wanglei/workspace/raw/03-Output/规划/2026-11-04-报价计算器')
from pipeline.cost_model import compute

source, params_file, scenario_file = map(Path, sys.argv[1:])
root = source.parent
p = json.loads(params_file.read_text())
s = json.loads(scenario_file.read_text())['selection']
ns = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}


def edit(name, sheet, cell):
    dest = root / (name + '.xlsx')
    with zipfile.ZipFile(source) as src, zipfile.ZipFile(dest, 'w') as out:
        for entry in src.infolist():
            data = src.read(entry.filename)
            if entry.filename == f'xl/worksheets/sheet{sheet}.xml':
                tree = ET.fromstring(data)
                c = tree.find(f'.//s:c[@r="{cell}"]', ns)
                assert c is not None, cell
                for child in list(c):
                    c.remove(child)
                c.attrib.pop('t', None)
                ET.SubElement(c, '{' + ns['s'] + '}v').text = '100'
                data = ET.tostring(tree, encoding='utf-8', xml_declaration=True)
            out.writestr(entry, data)
    return dest


def check(path, sheet, expected):
    output = root / (path.stem + '-csv')
    output.mkdir()
    profile = root / (path.stem + '-profile')
    cmd = ['/Applications/LibreOffice.app/Contents/MacOS/soffice',
           f'-env:UserInstallation={profile.as_uri()}', '--headless', '--convert-to',
           'csv:Text - txt - csv (StarCalc):44,34,76,1,,0,false,true,false,false,false,-1',
           '--outdir', str(output), str(path)]
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    print('START_PID', proc.pid, flush=True)
    try:
        stdout, stderr = proc.communicate(timeout=60)
    except subprocess.TimeoutExpired:
        proc.terminate()
        try:
            proc.communicate(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()
            proc.communicate()
        raise
    assert proc.returncode == 0, stdout + stderr
    with (output / f'{path.stem}-{sheet}.csv').open(encoding='utf-8-sig', newline='') as f:
        rows = list(csv.reader(f))
    actual = {}
    for cell, (value, digits) in expected.items():
        col = ord(cell[0]) - ord('A')
        actual[cell] = rows[int(cell[1:]) - 1][col]
        step = Decimal(1).scaleb(-digits)
        assert actual[cell] != '', f'{path.stem} {cell}: blank, expected {value}'
        assert Decimal(actual[cell]).quantize(step, rounding=ROUND_HALF_UP) == Decimal(str(value)).quantize(step, rounding=ROUND_HALF_UP), (path.stem, cell, actual[cell], value)
    print(path.stem, actual, 'Python 真值一致；exit_code=0', flush=True)
    assert proc.poll() is not None, 'own soffice PID has not exited'


direct_params = copy.deepcopy(p)
nearby = next(a for a in direct_params['packages']['c15-eu']['agents'] if a['id'] == 'p2-nearby')
assert nearby['first']['direct'] is None
nearby['first']['direct'] = 100
direct = compute(direct_params, s)
row = next(r for r in direct['rows'] if r['id'] == 'p2-nearby')
check(edit('direct-edit', 2, 'B107'), 'NRE 明细', {
    'G33': (row['direct'], 2), 'H33': (row['sum'], 2),
    'B16': (direct['nre']['direct'], 2), 'B19': (direct['nre']['known'], 2),
})
token_params = copy.deepcopy(p)
core = next(a for a in token_params['packages']['c15-eu']['agents'] if a['id'] == 'p1-core')
assert core['lic']['mode'] == 'scaled' and core['lic']['scaledBase'] is None
core['lic']['scaledBase'] = 100
token = compute(token_params, s)
fee = 100 * s['activeRate'] * s['dailyCalls'] / (p['lic']['baseActive'] * p['lic']['baseCalls'])
check(edit('token-edit', 3, 'B21'), 'LIC 明细', {
    'B22': (fee, 1), 'B16': (token['lic']['known'], 1),
})
