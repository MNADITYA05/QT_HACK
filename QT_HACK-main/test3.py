
from simulator import build_reference, check_solution
ok = True
for a in range(-2, 2):
    for b in range(-2, 2):
        r = check_solution(build_reference(a, b), a, b)
        if not r.correct:
            print(f"FAIL {a}*{b}={a*b} -> P={r.p_val} A={r.a_val} B={r.b_val} E={r.e_val} C={r.c_val}")
            ok = False
if ok: print("ALL OK")

